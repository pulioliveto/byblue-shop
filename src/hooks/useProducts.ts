import { useState, useEffect } from "react"
import { Product } from "@/lib/types/shop"

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        console.log("Products received:", data.data)
        console.log("Number of products:", data.data?.length)
        setProducts(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  return { products, loading, refetch: fetchProducts }
}
