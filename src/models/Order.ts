import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  }
})

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      // Generar por defecto si no se proporciona
      return `BP${Date.now()}${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
    }
  },
  userEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  items: [OrderItemSchema],
  shipping: {
    method: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true
    },
    address: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      street: String,
      number: String,
      apartment: String,
      city: String,
      province: String,
      postalCode: String,
      country: String
    }
  },
  payment: {
    method: {
      type: String,
      required: true
    },
    mercadoPagoId: String,
    externalReference: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending'
    }
  },
  totals: {
    subtotal: {
      type: Number,
      required: true
    },
    shipping: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Middleware para actualizar updatedAt
OrderSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Solo generar orderNumber si no existe (el API ya lo genera)
OrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    // Fallback simple si no se proporcionó
    this.orderNumber = `BP${Date.now()}${Math.floor(Math.random() * 9999).toString().padStart(4, '0')}`
  }
  next()
})

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)

export default Order
