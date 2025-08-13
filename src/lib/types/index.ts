export interface User {
  _id?: string;
  email: string;
  name: string;
  image?: string;
  role: 'USER' | 'ADMIN' | 'CREADOR';
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Para mostrar descuentos
  category: string;
  subcategory?: string;
  brand: string;
  images: string[];
  specifications: Record<string, any>; // Flexible para diferentes productos
  stock: number;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // ID del admin que lo creó
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number; // Precio al momento de agregar al carrito
}

export interface Order {
  _id?: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentId?: string; // ID de MercadoPago
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de categorías disponibles
export type ProductCategory = 
  | 'smartphones' 
  | 'laptops' 
  | 'tablets' 
  | 'accesorios' 
  | 'audio' 
  | 'gaming' 
  | 'smart-tv' 
  | 'otros';

// Estados de orden
export type OrderStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED';

// Roles de usuario
export type UserRole = 'USER' | 'ADMIN' | 'CREADOR';

// Interface para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Interface para paginación
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
