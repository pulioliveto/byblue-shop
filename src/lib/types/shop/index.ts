export interface Product {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  subcategory?: string
  brand: string
  images: string[]
  stock: number
  tags: string[]
  isActive: boolean
  createdAt: string
  hasDiscount?: boolean
  discountPercentage?: number
}

export interface Category {
  value: string
  label: string
}

export interface SortOption {
  value: string
  label: string
}

export type ViewMode = "grid" | "list"

export interface ProductFilters {
  searchTerm: string
  selectedCategory: string
  sortBy: string
}

export interface ShopState {
  products: Product[]
  filteredProducts: Product[]
  loading: boolean
  filters: ProductFilters
  viewMode: ViewMode
}
