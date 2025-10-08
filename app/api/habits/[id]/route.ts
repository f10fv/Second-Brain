import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const habit = await db.habit.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        habitEntries: {
          orderBy: {
            date: 'desc'
          }
        }
      }
    });

    if (!habit) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: habit
    });
  } catch (error) {
    console.error('Error fetching habit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch habit' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const existingHabit = await db.habit.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingHabit) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      );
    }

    const updatedHabit = await db.habit.update({
      where: {
        id: params.id
      },
      data: {
        title: body.title,
        description: body.description,
        frequency: body.frequency,
        streak: body.streak
      },
      include: {
        habitEntries: true
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedHabit,
      message: 'Habit updated successfully'
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update habit' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const existingHabit = await db.habit.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!existingHabit) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      );
    }

    await db.habitEntry.deleteMany({
      where: {
        habitId: params.id
      }
    });

    await db.habit.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete habit' },
      { status: 500 }
    );
  }
} 