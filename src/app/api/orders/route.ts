import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/connection'
import Order from '@/models/Order'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    await connectDB()
    
    const body = await request.json()
    const { items, shipping, payment, totals, notes } = body

    // Validar datos requeridos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Los items son requeridos' },
        { status: 400 }
      )
    }

    if (!shipping || !payment || !totals) {
      return NextResponse.json(
        { error: 'Datos de envío, pago y totales son requeridos' },
        { status: 400 }
      )
    }

    // Crear la orden
    const orderData = {
      userEmail: session.user.email,
      items: items.map((item: any) => ({
        productId: item._id,
        name: item.name,
        brand: item.brand,
        category: item.category,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity
      })),
      shipping,
      payment,
      totals,
      notes: notes || '',
      status: payment.status === 'approved' ? 'paid' : 'pending'
    }

    const order = new Order(orderData)
    await order.save()

    return NextResponse.json({
      success: true,
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.totals.total,
        createdAt: order.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    await connectDB()

    const orders = await Order.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      orders
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
