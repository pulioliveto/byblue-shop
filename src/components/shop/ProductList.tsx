import { Product, Category } from "@/lib/types/shop"
import ProductListItem from "./ProductListItem"

interface ProductListProps {
  products: Product[]
  categories: Category[]
}

export default function ProductList({ products, categories }: ProductListProps) {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {products.map((product, index) => (
        <ProductListItem 
          key={product._id} 
          product={product} 
          index={index} 
          categories={categories}
        />
      ))}
    </div>
  )
}
