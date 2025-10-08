import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(
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
    const { date, completed = true } = body;

    const habit = await db.habit.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    });

    if (!habit) {
      return NextResponse.json(
        { success: false, error: 'Habit not found' },
        { status: 404 }
      );
    }

    const entryDate = date ? new Date(date) : new Date();
    entryDate.setHours(0, 0, 0, 0);

    const existingEntry = await db.habitEntry.findUnique({
      where: {
        habitId_date: {
          habitId: params.id,
          date: entryDate
        }
      }
    });

    let habitEntry;
    if (existingEntry) {
      habitEntry = await db.habitEntry.update({
        where: {
          habitId_date: {
            habitId: params.id,
            date: entryDate
          }
        },
        data: {
          completed
        }
      });
    } else {
      habitEntry = await db.habitEntry.create({
        data: {
          habitId: params.id,
          date: entryDate,
          completed
        }
      });
    }

    const entries = await db.habitEntry.findMany({
      where: {
        habitId: params.id
      },
      orderBy: {
        date: 'desc'
      }
    });

    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    while (true) {
      const entry = entries.find(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === checkDate.getTime() && entry.completed;
      });

      if (entry) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    await db.habit.update({
      where: {
        id: params.id
      },
      data: {
        streak
      }
    });

    return NextResponse.json({
      success: true,
      data: habitEntry,
      message: 'Habit entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating habit entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update habit entry' },
      { status: 500 }
    );
  }
} 