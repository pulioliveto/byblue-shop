import { useState, useEffect } from "react"
import { Product } from "@/lib/types/shop"
import { filterActiveProducts, filterProductsBySearch, filterProductsByCategory } from "@/lib/utils/shop/productFilters"
import { sortProducts } from "@/lib/utils/shop/productSorters"

export function useProductFilters(products: Product[]) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    console.log("Total products:", products.length)
    
    let filtered = filterActiveProducts(products)
    console.log("Active products:", filtered.length)

    filtered = filterProductsBySearch(filtered, searchTerm)
    filtered = filterProductsByCategory(filtered, selectedCategory)
    filtered = sortProducts(filtered, sortBy)

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory, sortBy])

  return {
    filteredProducts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy
  }
}
