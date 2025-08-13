import mongoose, { Schema, Document } from 'mongoose';
import { Order as IOrder, OrderItem, Address } from '../types';

export interface OrderDocument extends IOrder, Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

const AddressSchema = new Schema<Address>({
  fullName: {
    type: String,
    required: [true, 'El nombre completo es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder los 100 caracteres']
  },
  street: {
    type: String,
    required: [true, 'La dirección es requerida'],
    trim: true,
    maxlength: [200, 'La dirección no puede exceder los 200 caracteres']
  },
  city: {
    type: String,
    required: [true, 'La ciudad es requerida'],
    trim: true,
    maxlength: [100, 'La ciudad no puede exceder los 100 caracteres']
  },
  state: {
    type: String,
    required: [true, 'El estado/provincia es requerido'],
    trim: true,
    maxlength: [100, 'El estado no puede exceder los 100 caracteres']
  },
  zipCode: {
    type: String,
    required: [true, 'El código postal es requerido'],
    trim: true,
    maxlength: [20, 'El código postal no puede exceder los 20 caracteres']
  },
  country: {
    type: String,
    required: [true, 'El país es requerido'],
    trim: true,
    default: 'Argentina'
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true,
    match: [/^[\d\s+()-]{10,20}$/, 'Formato de teléfono inválido']
  }
}, { _id: false });

const OrderItemSchema = new Schema<OrderItem>({
  productId: {
    type: String,
    required: [true, 'El ID del producto es requerido']
  },
  productName: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true
  },
  productImage: {
    type: String,
    required: [true, 'La imagen del producto es requerida']
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es requerida'],
    min: [1, 'La cantidad debe ser al menos 1']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  }
}, { _id: false });

const OrderSchema = new Schema<OrderDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  items: {
    type: [OrderItemSchema],
    required: [true, 'Los items son requeridos'],
    validate: {
      validator: function(items: OrderItem[]) {
        return items.length > 0;
      },
      message: 'La orden debe tener al menos un item'
    }
  },
  subtotal: {
    type: Number,
    required: [true, 'El subtotal es requerido'],
    min: [0, 'El subtotal no puede ser negativo']
  },
  shipping: {
    type: Number,
    required: [true, 'El costo de envío es requerido'],
    min: [0, 'El costo de envío no puede ser negativo'],
    default: 0
  },
  total: {
    type: Number,
    required: [true, 'El total es requerido'],
    min: [0, 'El total no puede ser negativo']
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  paymentId: {
    type: String,
    default: null,
    trim: true
  },
  shippingAddress: {
    type: AddressSchema,
    required: [true, 'La dirección de envío es requerida']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimización
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ paymentId: 1 });

// Virtual para obtener el número total de items
OrderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Middleware para validar que el total sea correcto
OrderSchema.pre('save', function(next) {
  const calculatedTotal = this.subtotal + this.shipping;
  if (Math.abs(this.total - calculatedTotal) > 0.01) { // Permitir diferencia mínima por redondeo
    const error = new Error('El total no coincide con subtotal + envío');
    return next(error);
  }
  next();
});

const Order = mongoose.models.Order as mongoose.Model<OrderDocument> || mongoose.model<OrderDocument>('Order', OrderSchema);

export default Order;
