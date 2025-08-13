import { Category, SortOption } from "@/lib/types/shop"

export const categories: Category[] = [
  { value: "all", label: "Todas las categorías" },
  { value: "smartphones", label: "Smartphones" },
  { value: "laptops", label: "Laptops" },
  { value: "tablets", label: "Tablets" },
  { value: "accesorios", label: "Accesorios" },
  { value: "audio", label: "Audio" },
  { value: "gaming", label: "Gaming" },
  { value: "smart-tv", label: "Smart TV" },
  { value: "otros", label: "Otros" },
]

export const sortOptions: SortOption[] = [
  { value: "newest", label: "Más recientes" },
  { value: "price-asc", label: "Precio: Menor a mayor" },
  { value: "price-desc", label: "Precio: Mayor a menor" },
  { value: "name-asc", label: "Nombre: A-Z" },
  { value: "name-desc", label: "Nombre: Z-A" },
]
