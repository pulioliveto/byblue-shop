import { Product, Category } from "@/lib/types/shop"
import ProductCard from "./ProductCard"

interface ProductGridProps {
  products: Product[]
  categories: Category[]
}

export default function ProductGrid({ products, categories }: ProductGridProps) {
  return (
    <div className="flex justify-center">
      <div 
        className="grid gap-8 max-w-7xl" 
        style={{
          gridTemplateColumns: `repeat(${Math.min(products.length, 4)}, minmax(280px, 320px))`,
          justifyContent: products.length === 1 ? 'center' : 
                         products.length === 2 ? 'center' : 
                         products.length === 3 ? 'center' : 'start'
        }}
      >
        {products.map((product, index) => (
          <ProductCard 
            key={product._id} 
            product={product} 
            index={index} 
            categories={categories}
          />
        ))}
      </div>
    </div>
  )
}
