import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const records = await db.financeRecord.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json({ success: true, data: records, count: records.length });
  } catch (error) {
    console.error('Error fetching finance records:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch finance records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    console.log("body", body);
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    if (!body.amount || typeof body.amount !== 'number') {
      return NextResponse.json({ success: false, error: 'Amount is required' }, { status: 400 });
    }
    if (!body.type) {
      return NextResponse.json({ success: false, error: 'Type is required' }, { status: 400 });
    }
    const newRecord = await db.financeRecord.create({
      data: {
        title: body.title.trim(),
        amount: body.amount,
        type: body.type,
        category: body.category ?? null,
        budgetCategory: body.budgetCategory ?? null,
        description: body.description ?? null,
        date: body.date ? new Date(body.date) : new Date(),
        userId: session.user.id,
      }
    });
    return NextResponse.json({ success: true, data: newRecord, message: 'Finance record created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating finance record:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 