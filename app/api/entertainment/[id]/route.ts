import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const item = await db.entertainmentItem.findFirst({
      where: { id: params.id, userId: session.user.id }
    });
    if (!item) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error('Error fetching entertainment item:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch entertainment item' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    console.log("body", body);  
    const existing = await db.entertainmentItem.findFirst({
      where: { id: params.id, userId: session.user.id }
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    const updated = await db.entertainmentItem.update({
      where: { id: params.id },
      data: {
        title: body.title,
        type: body.type,
        status: body.status,
        rating: body.rating,
        genre: body.genre,
        progress: body.progress,
        totalEpisodes: body.totalEpisodes,
        currentEpisode: body.currentEpisode,
        currentSeason: body.currentSeason,
        notes: body.notes,
      }
    });
    return NextResponse.json({ success: true, data: updated, message: 'Entertainment item updated successfully' });
  } catch (error) {
    console.error('Error updating entertainment item:', error);
    return NextResponse.json({ success: false, error: 'Failed to update entertainment item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const existing = await db.entertainmentItem.findFirst({
      where: { id: params.id, userId: session.user.id }
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Item not found' }, { status: 404 });
    }
    await db.entertainmentItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: 'Entertainment item deleted successfully' });
  } catch (error) {
    console.error('Error deleting entertainment item:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete entertainment item' }, { status: 500 });
  }
} 