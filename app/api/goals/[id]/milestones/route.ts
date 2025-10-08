import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
    }

    // Verify the goal belongs to the user
    const goal = await db.goal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!goal) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 })
    }

    const milestone = await db.milestone.create({
      data: {
        title,
        description,
        goalId: params.id,
      },
    })

    return NextResponse.json({ success: true, data: milestone })
  } catch (error) {
    console.error("Error creating milestone:", error)
    return NextResponse.json({ success: false, error: "Failed to create milestone" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { milestoneId, completed } = body

    if (milestoneId === undefined || completed === undefined) {
      return NextResponse.json({ success: false, error: "Milestone ID and completed status are required" }, { status: 400 })
    }

    // Verify the goal belongs to the user
    const goal = await db.goal.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!goal) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 })
    }

    const milestone = await db.milestone.update({
      where: {
        id: milestoneId,
        goalId: params.id,
      },
      data: {
        completed,
      },
    })

    // Update goal progress based on completed milestones
    const allMilestones = await db.milestone.findMany({
      where: {
        goalId: params.id,
      },
    })

    const completedMilestones = allMilestones.filter(m => m.completed).length
    const progress = allMilestones.length > 0 ? Math.round((completedMilestones / allMilestones.length) * 100) : 0
    
    // Auto-complete goal if all milestones are completed
    const newStatus = allMilestones.length > 0 && completedMilestones === allMilestones.length ? "COMPLETED" : "ACTIVE"

    await db.goal.update({
      where: {
        id: params.id,
      },
      data: {
        progress,
        status: newStatus,
      },
    })

    return NextResponse.json({ success: true, data: milestone, progress })
  } catch (error) {
    console.error("Error updating milestone:", error)
    return NextResponse.json({ success: false, error: "Failed to update milestone" }, { status: 500 })
  }
} 