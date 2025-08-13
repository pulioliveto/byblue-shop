import mongoose, { Schema, Document } from 'mongoose';
import { Product as IProduct } from '../types';

export interface ProductDocument extends IProduct, Document {
  _id: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  hasDiscount: boolean;
  discountPercentage: number;
}

const ProductSchema = new Schema<ProductDocument>({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [200, 'El nombre no puede exceder los 200 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [2000, 'La descripción no puede exceder los 2000 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  originalPrice: {
    type: Number,
    min: [0, 'El precio original no puede ser negativo'],
    default: null
  },
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true,
    enum: {
      values: ['smartphones', 'laptops', 'tablets', 'accesorios', 'audio', 'gaming', 'smart-tv', 'otros'],
      message: 'Categoría no válida'
    }
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [100, 'La subcategoría no puede exceder los 100 caracteres']
  },
  brand: {
    type: String,
    required: [true, 'La marca es requerida'],
    trim: true,
    maxlength: [100, 'La marca no puede exceder los 100 caracteres']
  },
  images: [{
    type: String,
    required: true
  }],
  specifications: {
    type: Schema.Types.Mixed,
    default: {}
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El creador del producto es requerido']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimización y búsquedas
ProductSchema.index({ name: 'text', description: 'text' }); // Búsqueda de texto
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ createdAt: -1 });

// Virtual para calcular si hay descuento
ProductSchema.virtual('hasDiscount').get(function(this: ProductDocument) {
  return this.originalPrice && this.originalPrice > this.price;
});

// Virtual para calcular porcentaje de descuento
ProductSchema.virtual('discountPercentage').get(function(this: ProductDocument) {
  if (!this.hasDiscount) return 0;
  return Math.round(((this.originalPrice! - this.price) / this.originalPrice!) * 100);
});

// Middleware para validar que originalPrice > price cuando se establece
ProductSchema.pre('save', function(this: ProductDocument, next) {
  if (this.originalPrice && this.originalPrice <= this.price) {
    const error = new Error('El precio original debe ser mayor al precio actual');
    return next(error);
  }
  next();
});

const Product = mongoose.models.Product as mongoose.Model<ProductDocument> || mongoose.model<ProductDocument>('Product', ProductSchema);

export default Product;
