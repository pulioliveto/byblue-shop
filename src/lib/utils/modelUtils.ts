import { Product, Order, Cart } from '../models';
import connectDB from '../connection';

/**
 * Utilidades para trabajar con productos
 */
export const ProductUtils = {
  /**
   * Buscar productos por categoría con paginación
   */
  async findByCategory(category: string, page = 1, limit = 12) {
    await connectDB();
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find({ category, isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Product.countDocuments({ category, isActive: true })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Buscar productos por texto
   */
  async searchProducts(query: string, page = 1, limit = 12) {
    await connectDB();
    const skip = (page - 1) * limit;
    
    const searchQuery = {
      $and: [
        { isActive: true },
        {
          $or: [
            { $text: { $search: query } },
            { name: { $regex: query, $options: 'i' } },
            { brand: { $regex: query, $options: 'i' } },
            { tags: { $in: [new RegExp(query, 'i')] } }
          ]
        }
      ]
    };

    const [products, total] = await Promise.all([
      Product.find(searchQuery)
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(searchQuery)
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Obtener productos relacionados
   */
  async getRelatedProducts(productId: string, limit = 4) {
    await connectDB();
    const product = await Product.findById(productId);
    
    if (!product) return [];

    return Product.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { brand: product.brand },
        { tags: { $in: product.tags } }
      ],
      isActive: true
    })
    .limit(limit)
    .sort({ createdAt: -1 });
  },

  /**
   * Verificar stock disponible
   */
  async checkStock(productId: string, quantity: number) {
    await connectDB();
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new Error('Producto no encontrado');
    }

    if (!product.isActive) {
      throw new Error('Producto no disponible');
    }

    if (product.stock < quantity) {
      throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);
    }

    return true;
  }
};

/**
 * Utilidades para trabajar con órdenes
 */
export const OrderUtils = {
  /**
   * Obtener órdenes de un usuario con paginación
   */
  async getUserOrders(userId: string, page = 1, limit = 10) {
    await connectDB();
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email'),
      Order.countDocuments({ userId })
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Calcular estadísticas de órdenes
   */
  async getOrderStats() {
    await connectDB();
    
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['PAID', 'SHIPPED', 'DELIVERED'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    return {
      byStatus: stats,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    };
  }
};

/**
 * Utilidades para trabajar con el carrito
 */
export const CartUtils = {
  /**
   * Obtener o crear carrito para un usuario
   */
  async getOrCreateCart(userId: string) {
    await connectDB();
    
    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      model: 'Product',
      select: 'name price images stock isActive'
    });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      await cart.save();
    }

    return cart;
  },

  /**
   * Sincronizar precios del carrito con los precios actuales de productos
   */
  async syncCartPrices(userId: string) {
    await connectDB();
    const cart = await Cart.findOne({ userId });
    
    if (!cart || cart.items.length === 0) return cart;

    let updated = false;
    
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product && product.price !== item.price) {
        item.price = product.price;
        updated = true;
      }
    }

    if (updated) {
      await cart.save();
    }

    return cart;
  }
};

/**
 * Utilidad para generar número de orden único
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ORDER-${timestamp}-${random}`.toUpperCase();
}
