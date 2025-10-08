import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const knowledgeNotes = await db.knowledgeNote.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ success: true, data: knowledgeNotes })
  } catch (error) {
    console.error("Error fetching knowledge notes:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch knowledge notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, category, tags } = body

    if (!title || !content) {
      return NextResponse.json({ success: false, error: "Title and content are required" }, { status: 400 })
    }

    const knowledgeNote = await db.knowledgeNote.create({
      data: {
        title,
        content,
        category,
        tags: tags || [],
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, data: knowledgeNote })
  } catch (error) {
    console.error("Error creating knowledge note:", error)
    return NextResponse.json({ success: false, error: "Failed to create knowledge note" }, { status: 500 })
  }
} 