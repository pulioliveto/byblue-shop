import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/connection';
import Product from '@/lib/models/Product';

// GET - Obtener un producto individual (público)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    // Buscar el producto por ID
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Solo mostrar productos activos en el frontend público
    if (!product.isActive) {
      return NextResponse.json(
        { success: false, message: 'Producto no disponible' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar permisos de admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CREADOR') {
      return NextResponse.json(
        { success: false, message: 'Sin permisos suficientes' },
        { status: 403 }
      );
    }

    await connectDB();

    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    // Buscar y eliminar el producto
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado exitosamente',
      data: deletedProduct
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar permisos de admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'CREADOR') {
      return NextResponse.json(
        { success: false, message: 'Sin permisos suficientes' },
        { status: 403 }
      );
    }

    await connectDB();

    const productId = params.id;
    const body = await request.json();

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    // Validaciones básicas
    const { name, description, price, category, brand, images, stock } = body;
    
    if (!name || !description || !price || !category || !brand || !images?.length || stock === undefined) {
      return NextResponse.json(
        { success: false, message: 'Todos los campos requeridos deben estar completos' },
        { status: 400 }
      );
    }

    // Buscar y actualizar el producto
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        ...body,
        updatedAt: new Date()
      },
      { 
        new: true, // Retornar el documento actualizado
        runValidators: true // Ejecutar validaciones del modelo
      }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
