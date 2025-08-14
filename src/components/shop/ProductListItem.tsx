"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import { Product, Category } from "@/lib/types/shop"
import AddToCartButton from "./AddToCartButton"

interface ProductListItemProps {
  product: Product
  index: number
  categories: Category[]
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(price)
}

export default function ProductListItem({ product, index, categories }: ProductListItemProps) {
  return (
    <Card
      className="p-6 bg-background/95 backdrop-blur-sm border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "fadeInUp 0.6s ease-out forwards",
      }}
    >
      <div className="flex gap-6">
        <Link href={`/product/${product._id}`} className="flex gap-6 flex-1">
          <div className="relative w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary/5 to-accent/10">
            {product.images.length > 0 ? (
              <Image 
                src={product.images[0] || "/placeholder.svg"} 
                alt={product.name} 
                fill 
                className="object-contain p-2" 
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center rounded-xl">
                <span className="text-muted-foreground text-xs font-medium">Sin imagen</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10 font-medium px-2 py-1">
                    {categories.find((cat) => cat.value === product.category)?.label}
                  </Badge>
                  {product.subcategory && (
                    <Badge variant="outline" className="text-xs border-border text-muted-foreground bg-muted/50 px-2 py-1">
                      {product.subcategory}
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                  {product.name}
                </h3>
                
                <p className="text-muted-foreground font-medium">{product.brand}</p>
                
                <p className="text-sm text-muted-foreground line-clamp-2 max-w-2xl leading-relaxed">
                  {product.description}
                </p>

                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {product.tags.slice(0, 4).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-muted/50 text-muted-foreground border-border font-medium px-2 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>

        <div className="flex flex-col items-end justify-between space-y-4 min-w-[200px]">
          <div className="text-right">
            {product.hasDiscount && (
              <Badge className="mb-2 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg font-semibold">
                -{product.discountPercentage}%
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge className="mb-2 bg-muted text-muted-foreground border-0 font-medium">Sin stock</Badge>
            )}
            {product.stock === 1 && (
              <Badge className="mb-2 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg font-semibold animate-pulse">
                ÚLTIMO DISPONIBLE
              </Badge>
            )}
            <div className="flex flex-col items-end gap-1">
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through font-medium">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{formatPrice(product.price)}</span>
            </div>

            <AddToCartButton 
              product={product}
              variant="default"
              size="default"
              className="mt-4 w-full"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
