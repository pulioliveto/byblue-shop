import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/connection';
import Product from '@/lib/models/Product';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    const skip = (page - 1) * limit;
    
    // Construir filtros
    const filters: any = {};
    
    if (category && category !== 'all') {
      filters.category = category;
    }
    
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (active !== null && active !== undefined) {
      filters.isActive = active === 'true';
    }

    // Obtener productos con paginación
    const products = await Product.find(filters)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filters);

    console.log('Products found:', products.length);
    console.log('Total products:', total);
    console.log('Filters applied:', filters);

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
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verificar que el usuario tenga permisos de admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CREADOR')) {
      return NextResponse.json(
        { success: false, message: 'Sin permisos suficientes' },
        { status: 403 }
      );
    }

    const data = await request.json();
    
    // Validar datos requeridos
    const requiredFields = ['name', 'description', 'price', 'category', 'brand'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, message: `El campo ${field} es requerido` },
          { status: 400 }
        );
      }
    }

    // Preparar datos del producto
    const productData = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      category: data.category,
      subcategory: data.subcategory,
      brand: data.brand,
      images: data.images && data.images.length > 0 ? data.images : ['/placeholder-product.png'],
      specifications: data.specifications || {},
      stock: parseInt(data.stockQuantity) || 0,
      isActive: data.isActive !== false,
      tags: data.tags || [],
      createdBy: user._id
    };

    // Validar que el precio sea válido
    if (isNaN(productData.price) || productData.price <= 0) {
      return NextResponse.json(
        { success: false, message: 'El precio debe ser un número válido mayor a 0' },
        { status: 400 }
      );
    }

    // Validar que el stock sea válido
    if (isNaN(productData.stock) || productData.stock < 0) {
      return NextResponse.json(
        { success: false, message: 'El stock debe ser un número válido mayor o igual a 0' },
        { status: 400 }
      );
    }

    // Crear el producto
    const product = new Product(productData);
    console.log('Product data before save:', productData);
    await product.save();
    console.log('Product after save:', product.toObject());

    // Poblar los datos del creador
    await product.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Producto creado exitosamente',
      product: product.toObject()
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating product:', error);

    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, message: 'Error de validación', errors },
        { status: 400 }
      );
    }

    // Manejar errores de duplicado
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Ya existe un producto con ese nombre' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verificar que el usuario tenga permisos de admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CREADOR')) {
      return NextResponse.json(
        { success: false, message: 'Sin permisos suficientes' },
        { status: 403 }
      );
    }

    const data = await request.json();
    const { productId, ...updateData } = data;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'ID del producto requerido' },
        { status: 400 }
      );
    }

    // Buscar y actualizar el producto
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar los campos
    Object.assign(product, updateData);
    await product.save();

    await product.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      product: product.toObject()
    });

  } catch (error: any) {
    console.error('Error updating product:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, message: 'Error de validación', errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verificar que el usuario tenga permisos de admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'CREADOR')) {
      return NextResponse.json(
        { success: false, message: 'Sin permisos suficientes' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { success: false, message: 'ID del producto requerido' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Producto no encontrado' },
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(productId);

    return NextResponse.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
