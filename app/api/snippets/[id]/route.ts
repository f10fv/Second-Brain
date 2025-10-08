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
    const { title, description, code, language, category, tags, favorite } = body

    const codeSnippet = await db.codeSnippet.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        title,
        description,
        code,
        language,
        category,
        tags: tags || [],
        favorite,
        lastUsed: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: codeSnippet })
  } catch (error) {
    console.error("Error updating code snippet:", error)
    return NextResponse.json({ success: false, error: "Failed to update code snippet" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await db.codeSnippet.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting code snippet:", error)
    return NextResponse.json({ success: false, error: "Failed to delete code snippet" }, { status: 500 })
  }
} 