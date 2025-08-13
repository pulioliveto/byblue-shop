import { z } from 'zod';

// Schema de validación para Usuario
export const UserSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase().trim(),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres').trim(),
  image: z.string().url('URL inválida').optional().nullable(),
  role: z.enum(['USER', 'ADMIN', 'CREADOR']).default('USER')
});

// Schema de validación para Producto
export const ProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200, 'Máximo 200 caracteres').trim(),
  description: z.string().min(1, 'La descripción es requerida').max(2000, 'Máximo 2000 caracteres').trim(),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  originalPrice: z.number().min(0, 'El precio original no puede ser negativo').optional().nullable(),
  category: z.enum([
    'smartphones', 
    'laptops', 
    'tablets', 
    'accesorios', 
    'audio', 
    'gaming', 
    'smart-tv', 
    'otros'
  ]),
  brand: z.string().min(1, 'La marca es requerida').max(100, 'Máximo 100 caracteres').trim(),
  images: z.array(z.string().url('URL de imagen inválida')).min(1, 'Al menos una imagen es requerida'),
  specifications: z.record(z.string(), z.any()).default({}),
  stock: z.number().int().min(0, 'El stock no puede ser negativo').default(0),
  isActive: z.boolean().default(true),
  tags: z.array(z.string().trim().toLowerCase()).default([]),
  createdBy: z.string().min(1, 'El creador es requerido')
});

// Schema de validación para Dirección
export const AddressSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es requerido').max(100, 'Máximo 100 caracteres').trim(),
  street: z.string().min(1, 'La dirección es requerida').max(200, 'Máximo 200 caracteres').trim(),
  city: z.string().min(1, 'La ciudad es requerida').max(100, 'Máximo 100 caracteres').trim(),
  state: z.string().min(1, 'El estado/provincia es requerido').max(100, 'Máximo 100 caracteres').trim(),
  zipCode: z.string().min(1, 'El código postal es requerido').max(20, 'Máximo 20 caracteres').trim(),
  country: z.string().min(1, 'El país es requerido').default('Argentina'),
  phone: z.string().regex(/^[\d\s+()-]{10,20}$/, 'Formato de teléfono inválido')
});

// Schema de validación para Item de Orden
export const OrderItemSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido'),
  productName: z.string().min(1, 'El nombre del producto es requerido').trim(),
  productImage: z.string().url('URL de imagen inválida'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
  price: z.number().min(0, 'El precio no puede ser negativo')
});

// Schema de validación para Orden
export const OrderSchema = z.object({
  userId: z.string().min(1, 'El usuario es requerido'),
  items: z.array(OrderItemSchema).min(1, 'Al menos un item es requerido'),
  subtotal: z.number().min(0, 'El subtotal no puede ser negativo'),
  shipping: z.number().min(0, 'El costo de envío no puede ser negativo').default(0),
  total: z.number().min(0, 'El total no puede ser negativo'),
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']).default('PENDING'),
  paymentId: z.string().optional().nullable(),
  shippingAddress: AddressSchema
});

// Schema de validación para Item de Carrito
export const CartItemSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
  price: z.number().min(0, 'El precio no puede ser negativo')
});

// Schema de validación para agregar al carrito
export const AddToCartSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1')
});

// Schema de validación para actualizar carrito
export const UpdateCartSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido'),
  quantity: z.number().int().min(0, 'La cantidad no puede ser negativa')
});

// Schemas para formularios de registro/login
export const RegisterSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

// Schema para búsqueda de productos
export const ProductSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(12),
  sortBy: z.enum(['name', 'price', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Tipos inferidos de los schemas
export type UserInput = z.infer<typeof UserSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
export type OrderInput = z.infer<typeof OrderSchema>;
export type AddressInput = z.infer<typeof AddressSchema>;
export type CartItemInput = z.infer<typeof CartItemSchema>;
export type AddToCartInput = z.infer<typeof AddToCartSchema>;
export type UpdateCartInput = z.infer<typeof UpdateCartSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ProductSearchInput = z.infer<typeof ProductSearchSchema>;
