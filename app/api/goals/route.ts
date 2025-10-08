import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const goals = await db.goal.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        milestones: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ success: true, data: goals })
  } catch (error) {
    console.error("Error fetching goals:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, category, targetDate, milestones } = body

    if (!title || !category) {
      return NextResponse.json({ success: false, error: "Title and category are required" }, { status: 400 })
    }

    const goal = await db.goal.create({
      data: {
        title,
        description,
        category,
        targetDate: targetDate ? new Date(targetDate) : null,
        userId: session.user.id,
        milestones: {
          create: milestones?.filter((m: string) => m.trim() !== "").map((milestone: string) => ({
            title: milestone,
          })) || [],
        },
      },
      include: {
        milestones: true,
      },
    })

    return NextResponse.json({ success: true, data: goal })
  } catch (error) {
    console.error("Error creating goal:", error)
    return NextResponse.json({ success: false, error: "Failed to create goal" }, { status: 500 })
  }
} 