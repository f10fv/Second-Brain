import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const wishlistItems = await db.wishlistItem.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({ success: true, data: wishlistItems })
  } catch (error) {
    console.error("Error fetching wishlist items:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch wishlist items" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, price, category, priority, url } = body

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 })
    }

    const wishlistItem = await db.wishlistItem.create({
      data: {
        title,
        description,
        price,
        category,
        priority: priority || "MEDIUM",
        url,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, data: wishlistItem })
  } catch (error) {
    console.error("Error creating wishlist item:", error)
    return NextResponse.json({ success: false, error: "Failed to create wishlist item" }, { status: 500 })
  }
} 