import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/connection';
import Product from '@/lib/models/Product';
import { hasPermission } from '@/lib/permissions';
import { ProductSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // ADMIN y CREADOR pueden crear productos
    if (!hasPermission(session.user.role, 'canCreateProducts')) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para crear productos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const productData = ProductSchema.parse({
      ...body,
      createdBy: session.user.id
    });

    await connectDB();
    
    const product = new Product(productData);
    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Producto creado exitosamente',
      data: product
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // ADMIN y CREADOR pueden ver productos en el panel admin
    if (!hasPermission(session.user.role, 'canViewProducts')) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para ver productos' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    
    const skip = (page - 1) * limit;
    
    // Construir filtro
    const filter: any = {};
    if (category) {
      filter.category = category;
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // ADMIN y CREADOR pueden editar productos
    if (!hasPermission(session.user.role, 'canEditProducts')) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para editar productos' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { productId, ...updateData } = body;

    await connectDB();
    
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    Object.assign(product, updateData);
    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: product
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    // ADMIN y CREADOR pueden eliminar productos
    if (!hasPermission(session.user.role, 'canDeleteProducts')) {
      return NextResponse.json(
        { success: false, error: 'No tienes permisos para eliminar productos' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'ID de producto requerido' },
        { status: 400 }
      );
    }

    await connectDB();
    
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(productId);

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar producto:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
