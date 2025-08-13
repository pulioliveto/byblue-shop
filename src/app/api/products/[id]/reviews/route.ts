import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/connection"
import { getServerSession } from "next-auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = await connectDB()
    const { id } = params

    // Obtener reseñas del producto
    const reviews = await db.collection("reviews")
      .find({ productId: id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      success: true,
      data: reviews
    })

  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Error interno del servidor" 
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "No autorizado" },
        { status: 401 }
      )
    }

    const db = await connectDB()
    const { id } = params
    const body = await request.json()
    const { rating, comment } = body

    if (!rating || !comment || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Datos inválidos" },
        { status: 400 }
      )
    }

    // Verificar que el producto existe
    const product = await db.collection("products").findOne({ 
      _id: id,
      isActive: true 
    })

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Producto no encontrado" },
        { status: 404 }
      )
    }

    // Crear la reseña
    const review = {
      _id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: id,
      userId: session.user.id || session.user.email,
      userName: session.user.name || "Usuario",
      userAvatar: session.user.image,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      verified: false // TODO: Verificar si el usuario compró el producto
    }

    await db.collection("reviews").insertOne(review)

    return NextResponse.json({
      success: true,
      data: review,
      message: "Reseña agregada exitosamente"
    })

  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Error interno del servidor" 
      },
      { status: 500 }
    )
  }
}
