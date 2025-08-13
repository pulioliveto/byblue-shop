import mongoose, { Schema, Document } from 'mongoose';
import { CartItem as ICartItem } from '../types';

export interface CartDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  updatedAt: Date;
  createdAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: {
    type: String,
    required: [true, 'El ID del producto es requerido']
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

const CartSchema = new Schema<CartDocument>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido'],
    unique: true
  },
  items: {
    type: [CartItemSchema],
    default: []
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
CartSchema.index({ userId: 1 });
CartSchema.index({ updatedAt: -1 });

// Virtual para calcular el total de items
CartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual para calcular el subtotal
CartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
});

// Método para agregar item al carrito
CartSchema.methods.addItem = function(productId: string, quantity: number, price: number) {
  const existingItemIndex = this.items.findIndex((item: ICartItem) => item.productId === productId);
  
  if (existingItemIndex > -1) {
    // Si el producto ya existe, actualizar cantidad
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price; // Actualizar precio por si cambió
  } else {
    // Si no existe, agregar nuevo item
    this.items.push({ productId, quantity, price });
  }
  
  return this.save();
};

// Método para actualizar cantidad de un item
CartSchema.methods.updateItemQuantity = function(productId: string, quantity: number) {
  const itemIndex = this.items.findIndex((item: ICartItem) => item.productId === productId);
  
  if (itemIndex > -1) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1);
    } else {
      this.items[itemIndex].quantity = quantity;
    }
    return this.save();
  }
  
  throw new Error('Producto no encontrado en el carrito');
};

// Método para remover item del carrito
CartSchema.methods.removeItem = function(productId: string) {
  this.items = this.items.filter((item: ICartItem) => item.productId !== productId);
  return this.save();
};

// Método para limpiar el carrito
CartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

const Cart = mongoose.models.Cart as mongoose.Model<CartDocument> || mongoose.model<CartDocument>('Cart', CartSchema);

export default Cart;
