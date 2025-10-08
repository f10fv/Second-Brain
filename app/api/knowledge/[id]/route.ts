import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, category, tags } = body

    const knowledgeNote = await db.knowledgeNote.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        title,
        content,
        category,
        tags: tags || [],
      },
    })

    return NextResponse.json({ success: true, data: knowledgeNote })
  } catch (error) {
    console.error("Error updating knowledge note:", error)
    return NextResponse.json({ success: false, error: "Failed to update knowledge note" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await db.knowledgeNote.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting knowledge note:", error)
    return NextResponse.json({ success: false, error: "Failed to delete knowledge note" }, { status: 500 })
  }
} 