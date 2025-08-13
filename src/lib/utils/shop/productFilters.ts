import { Product } from "@/lib/types/shop"

export const filterProductsBySearch = (products: Product[], searchTerm: string): Product[] => {
  if (!searchTerm) return products
  
  const term = searchTerm.toLowerCase()
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(term) ||
      product.description.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term) ||
      product.tags.some((tag) => tag.toLowerCase().includes(term))
  )
}

export const filterProductsByCategory = (products: Product[], category: string): Product[] => {
  if (!category || category === "all") return products
  return products.filter((product) => product.category === category)
}

export const filterActiveProducts = (products: Product[]): Product[] => {
  return products.filter((product) => product.isActive)
}
