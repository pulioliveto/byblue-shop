"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Trash2 } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import { formatPrice } from "@/lib/utils"
import { CartItem } from "@/contexts/CartContext"

interface CartProductItemProps {
  item: CartItem
  index: number
}

export default function CartProductItem({ item, index }: CartProductItemProps) {
  const { updateQuantity, removeItem } = useCart()

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item._id, newQuantity)
  }

  return (
    <div 
      className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-lg"
      style={{
        animation: `fadeInUp 0.4s ease-out ${index * 100}ms both`
      }}
    >
      <div className="flex gap-4">
        {/* Imagen del producto */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
          <Image
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Info del producto */}
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-base">
              {item.name}
            </h4>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{item.brand}</span>
              <span>•</span>
              <span>{item.category}</span>
            </div>
          </div>
          
          {/* Precio */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {formatPrice(item.price)}
            </span>
            {item.originalPrice && (
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(item.originalPrice)}
              </span>
            )}
          </div>

          {/* Controles de cantidad */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white dark:hover:bg-gray-600"
                onClick={() => handleQuantityChange(item.quantity - 1)}
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-semibold min-w-[2rem] text-center px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                {item.quantity}
              </span>
              
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-white dark:hover:bg-gray-600"
                onClick={() => handleQuantityChange(item.quantity + 1)}
                disabled={item.quantity >= item.stock}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
              onClick={() => removeItem(item._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Subtotal por producto */}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-bold text-green-600 dark:text-green-400">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>

          {/* Stock warning */}
          {item.quantity >= item.stock && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-200 dark:border-amber-700">
              <span>⚠️</span>
              <span>Stock máximo: {item.stock}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
