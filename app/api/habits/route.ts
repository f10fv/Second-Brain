import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const habits = await db.habit.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        habitEntries: {
          orderBy: {
            date: 'desc'
          },
          take: 30 // Get last 30 entries for streak calculation
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate current streak for each habit
    const habitsWithStreak = habits.map(habit => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let currentStreak = 0;
      let checkDate = new Date(today);
      
      // Check consecutive days from today backwards
      while (true) {
        const entry = habit.habitEntries.find(entry => {
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === checkDate.getTime() && entry.completed;
        });
        
        if (entry) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      return {
        ...habit,
        currentStreak
      };
    });

    return NextResponse.json({
      success: true,
      data: habitsWithStreak,
      count: habitsWithStreak.length
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch habits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    const newHabit = await db.habit.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        frequency: body.frequency || "daily",
        streak: 0,
        userId: session.user.id,
      },
      include: {
        habitEntries: true
      }
    });

    return NextResponse.json(
      {
        success: true,
        data: newHabit,
        message: 'Habit created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 