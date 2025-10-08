import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const items = await db.entertainmentItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: items, count: items.length });
  } catch (error) {
    console.error('Error fetching entertainment items:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch entertainment items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json()
    console.log("body", body);
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Title is required' }, { status: 400 });
    }
    if (!body.type) {
      return NextResponse.json({ success: false, error: 'Type is required' }, { status: 400 });
    }
    const newItem = await db.entertainmentItem.create({
      data: {
        title: body.title.trim(),
        type: body.type,
        status: body.status || 'WANT_TO_WATCH',
        rating: body.rating ?? null,
        genre: body.genre ?? null,
        progress: body.progress ?? 0,
        totalEpisodes: body.totalEpisodes ?? null,
        currentEpisode: body.currentEpisode ?? null,
        currentSeason: body.currentSeason ?? null,
        year: body.year ?? null,
        notes: body.notes ?? null,
        userId: session.user.id,
      }
    });
    return NextResponse.json({ success: true, data: newItem, message: 'Entertainment item created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating entertainment item:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
} 