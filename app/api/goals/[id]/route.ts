import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, category, targetDate, milestones } = body

    // First, update the goal
    const goal = await db.goal.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        title,
        description,
        category,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
      include: {
        milestones: true,
      },
    })

    // Update milestones if provided
    if (milestones && Array.isArray(milestones)) {
      // Delete existing milestones
      await db.milestone.deleteMany({
        where: {
          goalId: params.id,
        },
      })

      // Create new milestones
      if (milestones.length > 0) {
        await db.milestone.createMany({
          data: milestones.map((milestone: any) => ({
            title: milestone.title,
            goalId: params.id,
          })),
        })
      }
    }

    // Recalculate progress and check for completion
    const updatedGoal = await db.goal.findUnique({
      where: { id: params.id },
      include: { milestones: true },
    })

    if (updatedGoal) {
      const totalMilestones = updatedGoal.milestones.length
      const completedMilestones = updatedGoal.milestones.filter(m => m.completed).length
      const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
      
      // Auto-complete goal if all milestones are completed
      const newStatus = totalMilestones > 0 && completedMilestones === totalMilestones ? "COMPLETED" : "ACTIVE"

      await db.goal.update({
        where: { id: params.id },
        data: {
          progress,
          status: newStatus,
        },
      })

      // Return updated goal
      const finalGoal = await db.goal.findUnique({
        where: { id: params.id },
        include: { milestones: true },
      })

      return NextResponse.json({ success: true, data: finalGoal })
    }

    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    console.error("Error updating goal:", error)
    return NextResponse.json({ success: false, error: "Failed to update goal" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await db.goal.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting goal:", error)
    return NextResponse.json({ success: false, error: "Failed to delete goal" }, { status: 500 })
  }
} 