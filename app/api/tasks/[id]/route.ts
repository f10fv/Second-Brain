import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const data = await request.json();
    const updated = await db.task.update({
      where: { id: params.id, userId: session.user.id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        completed: data.completed,
        projectId: data.projectId,
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    await db.task.delete({
      where: { id: params.id, userId: session.user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to delete task" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const task = await db.task.findUnique({
      where: { id: params.id, userId: session.user.id },
    });
    if (!task) {
      return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    }
    const newTask = await db.task.create({
      data: {
        title: task.title + " (Copy)",
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        completed: false,
        userId: session.user.id,
        projectId: task.projectId,
      },
    });
    return NextResponse.json({ success: true, data: newTask });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to duplicate task" }, { status: 500 });
  }
} 