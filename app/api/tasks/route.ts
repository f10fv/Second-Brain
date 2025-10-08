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

    const tasks = await db.task.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        project: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: tasks,
      count: tasks.length
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
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
    console.log("this the body", body)
    if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }



    let dueDate: Date | null = null;
    if (body.dueDate) {
      dueDate = new Date(body.dueDate);
      if (isNaN(dueDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid due date' },
          { status: 400 }
        );
      }
    }


      const newTask = await db.task.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        priority: body.priority || "MEDIUM",
        dueDate,
        completed: false,
        userId: session.user.id,
        projectId: body.project || null,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newTask,
        message: 'Task created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
