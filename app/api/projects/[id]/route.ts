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
    const updated = await db.project.update({
      where: { id: params.id, userId: session.user.id },
      data: {
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        status: data.status ? data.status.toUpperCase() : undefined,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        progress: typeof data.progress === 'number' ? data.progress : undefined,
      },
      include: {
        tasks: {
          select: {
            id: true,
            title: true,
            completed: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    await db.project.delete({ where: { id: params.id, userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PROJECT_DELETE_ERROR]', error);
    return NextResponse.json({ success: false, error: "Failed to delete project" }, { status: 500 });
  }
}