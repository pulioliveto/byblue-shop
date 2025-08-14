import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/connection'
import Order from '@/models/Order'
import Product from '@/lib/models/Product'

export async function POST(request: NextRequest) {
  console.log('=== ORDERS API POST ENDPOINT CALLED ===')
  
  try {
    const session = await getServerSession(authOptions)
    console.log('Session check result:', { 
      hasSession: !!session, 
      email: session?.user?.email 
    })
    
    if (!session?.user?.email) {
      console.error('User not authenticated')
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    console.log('Connecting to database...')
    await connectDB()
    console.log('Database connected successfully')
    
    const body = await request.json()
    console.log('Received order data:', JSON.stringify(body, null, 2))
    
    const { items, shipping, payment, totals, notes } = body

    // Validar datos requeridos
    console.log('Validating required data...')
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Items validation failed:', items)
      return NextResponse.json(
        { error: 'Los items son requeridos' },
        { status: 400 }
      )
    }

    if (!shipping || !payment || !totals) {
      console.error('Missing required data:', { 
        hasShipping: !!shipping, 
        hasPayment: !!payment, 
        hasTotals: !!totals 
      })
      return NextResponse.json(
        { error: 'Datos de envío, pago y totales son requeridos' },
        { status: 400 }
      )
    }

    console.log('All validations passed, creating order...')

    // Verificar y actualizar stock de los productos
    console.log('Checking and updating product stock...')
    for (const item of items) {
      const productId = item.productId || item._id
      const product = await Product.findById(productId)
      
      if (!product) {
        console.error(`Product not found: ${productId}`)
        return NextResponse.json(
          { error: `Producto no encontrado: ${productId}` },
          { status: 400 }
        )
      }

      if (product.stock < item.quantity) {
        console.error(`Insufficient stock for product ${productId}. Available: ${product.stock}, Requested: ${item.quantity}`)
        return NextResponse.json(
          { error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}` },
          { status: 400 }
        )
      }

      // Actualizar stock
      const oldStock = product.stock
      product.stock -= item.quantity
      
      // Solo actualizar el campo de stock sin triggear validaciones de precio
      await Product.findByIdAndUpdate(
        productId, 
        { $inc: { stock: -item.quantity } },
        { new: false, runValidators: false } // No ejecutar validadores para evitar el error de precio
      )
      
      console.log(`Stock updated for ${product.name}: ${oldStock} -> ${oldStock - item.quantity}`)
    }

    // Generar orderNumber manualmente para evitar problemas con el middleware
    const count = await Order.countDocuments()
    const orderNumber = `BP${Date.now()}${(count + 1).toString().padStart(4, '0')}`
    console.log('Generated order number:', orderNumber)

    // Crear la orden
    const orderData = {
      orderNumber, // Agregamos el orderNumber generado manualmente
      userEmail: session.user.email,
      items: items.map((item: any) => ({
        productId: item.productId || item._id, // Usar productId si existe, sino usar _id
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

    console.log('Order data prepared:', JSON.stringify(orderData, null, 2))

    console.log('Creating Order instance...')
    const order = new Order(orderData)
    
    console.log('Saving order to database...')
    await order.save()
    console.log('Order saved successfully:', {
      id: order._id,
      orderNumber: order.orderNumber,
      status: order.status
    })

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
    console.error('=== ERROR IN ORDERS API ===')
    console.error('Error details:', error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
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
