import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const updatedRecord = await db.financeRecord.update({
      where: { 
        id: params.id,
        userId: session.user.id 
      },
      data: {
        title: body.title,
        amount: body.amount,
        type: body.type,
        category: body.category,
        budgetCategory: body.budgetCategory,
        description: body.description,
        date: body.date ? new Date(body.date) : undefined,
      }
    });
    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error('Error updating finance record:', error);
    return NextResponse.json({ success: false, error: 'Failed to update finance record' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    await db.financeRecord.delete({
      where: { 
        id: params.id,
        userId: session.user.id 
      }
    });
    return NextResponse.json({ success: true, message: 'Finance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting finance record:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete finance record' }, { status: 500 });
  }
} 