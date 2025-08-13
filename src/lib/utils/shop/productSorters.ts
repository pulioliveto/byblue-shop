import { Product } from "@/lib/types/shop"

export const sortProducts = (products: Product[], sortBy: string): Product[] => {
  const sorted = [...products]
  
  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price)
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price)
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name))
    case "newest":
    default:
      return sorted.sort((a, b) => 
        new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
      )
  }
}
