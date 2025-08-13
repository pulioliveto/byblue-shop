"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Zap } from "lucide-react"
import { Product, Category } from "@/lib/types/shop"
import AddToCartButton from "./AddToCartButton"

interface ProductCardProps {
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

export default function ProductCard({ product, index, categories }: ProductCardProps) {
  return (
    <Card
      className="group relative overflow-hidden bg-background/95 backdrop-blur-sm border-border hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 w-full max-w-[320px] mx-auto"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "fadeInUp 0.6s ease-out forwards",
      }}
    >
      <Link href={`/product/${product._id}`}>
        <CardHeader className="p-0">
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/5 to-accent/10 cursor-pointer">
            {product.images.length > 0 ? (
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                <span className="text-muted-foreground font-medium">Sin imagen</span>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {product.hasDiscount && (
              <Badge className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg font-semibold">
                -{product.discountPercentage}%
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge className="absolute top-4 left-4 bg-muted text-muted-foreground border-0 font-medium">Sin stock</Badge>
            )}

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-xl transform scale-95 group-hover:scale-100 transition-transform duration-300"
              >
                <Zap className="w-5 h-5 mr-2" />
                Vista rápida
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-3">
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

          <div className="space-y-2">
            <CardTitle className="text-lg mb-1 line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-300 font-semibold leading-tight">
              {product.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-center gap-2">
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through font-medium">{formatPrice(product.originalPrice)}</span>
            )}
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{formatPrice(product.price)}</span>
          </div>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => (
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
        </CardContent>
      </Link>

      <CardFooter className="p-6 pt-0">
        <AddToCartButton 
          product={product}
          variant="default"
          size="default"
          className="w-full"
        />
      </CardFooter>
    </Card>
  )
}
