"use client"

import { ShoppingCart, Plus, Minus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"
import { Product } from "@/lib/types/shop"

interface AddToCartButtonProps {
  product: Product
  variant?: "default" | "minimal" | "icon"
  size?: "sm" | "default" | "lg"
  className?: string
}

export default function AddToCartButton({ 
  product, 
  variant = "default", 
  size = "default",
  className = "" 
}: AddToCartButtonProps) {
  const { addItem, isInCart, getItemQuantity, updateQuantity } = useCart()
  
  const isProductInCart = isInCart(product._id!)
  const quantity = getItemQuantity(product._id!)
  
  const handleAddToCart = () => {
    if (product.stock <= 0) return
    
    const cartItem = {
      _id: product._id!,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0] || '',
      stock: product.stock,
      category: product.category,
      brand: product.brand
    }
    
    addItem(cartItem)
  }
  
  const handleIncrement = () => {
    if (quantity < product.stock) {
      updateQuantity(product._id!, quantity + 1)
    }
  }
  
  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product._id!, quantity - 1)
    } else {
      updateQuantity(product._id!, 0) // Esto eliminará el item
    }
  }
  
  // Si está sin stock
  if (product.stock <= 0) {
    return (
      <Button 
        disabled 
        size={size}
        className={`${className} bg-muted text-muted-foreground cursor-not-allowed`}
      >
        Sin stock
      </Button>
    )
  }
  
  // Si el producto NO está en el carrito
  if (!isProductInCart) {
    if (variant === "icon") {
      return (
        <Button
          onClick={handleAddToCart}
          size={size}
          className={`${className} bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
        >
          <ShoppingCart className="w-4 h-4" />
        </Button>
      )
    }
    
    if (variant === "minimal") {
      return (
        <Button
          onClick={handleAddToCart}
          size={size}
          variant="outline"
          className={`${className} border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300`}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Agregar
        </Button>
      )
    }
    
    // Variant default
    return (
      <Button
        onClick={handleAddToCart}
        size={size}
        className={`${className} bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Agregar al carrito
      </Button>
    )
  }
  
  // Si el producto YA está en el carrito - mostrar controles de cantidad
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        onClick={handleDecrement}
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0 border-primary text-primary hover:bg-primary hover:text-white"
      >
        <Minus className="w-3 h-3" />
      </Button>
      
      <div className="flex items-center justify-center min-w-[3rem] h-8 bg-primary/10 text-primary font-semibold text-sm rounded border border-primary/20">
        {quantity}
      </div>
      
      <Button
        onClick={handleIncrement}
        size="sm"
        variant="outline"
        disabled={quantity >= product.stock}
        className="h-8 w-8 p-0 border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-3 h-3" />
      </Button>
      
      <div className="flex items-center text-green-600 ml-2">
        <Check className="w-4 h-4 mr-1" />
        <span className="text-xs font-medium">En carrito</span>
      </div>
    </div>
  )
}
