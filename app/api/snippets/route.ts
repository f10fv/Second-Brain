import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const codeSnippets = await db.codeSnippet.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ success: true, data: codeSnippets })
  } catch (error) {
    console.error("Error fetching code snippets:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch code snippets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, code, language, category, tags } = body

    if (!title || !code || !language) {
      return NextResponse.json({ success: false, error: "Title, code, and language are required" }, { status: 400 })
    }

    const codeSnippet = await db.codeSnippet.create({
      data: {
        title,
        description,
        code,
        language,
        category,
        tags: tags || [],
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, data: codeSnippet })
  } catch (error) {
    console.error("Error creating code snippet:", error)
    return NextResponse.json({ success: false, error: "Failed to create code snippet" }, { status: 500 })
  }
} 