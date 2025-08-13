"use client"

import { useCart } from "@/contexts/CartContext"
import { formatPrice } from "@/lib/utils"
import Image from "next/image"
import { Package, ShoppingCart } from "lucide-react"

export default function CheckoutSummary() {
  const { state } = useCart()

  if (state.items.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingCart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No hay productos en el carrito</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Productos a comprar ({state.itemCount} {state.itemCount === 1 ? 'artículo' : 'artículos'})
        </h3>
      </div>

      {/* Lista de productos */}
      <div className="space-y-4">
        {state.items.map((item) => (
          <div key={item._id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Imagen del producto */}
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
              <Image
                src={item.image || '/placeholder.svg'}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Info del producto */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                {item.name}
              </h4>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <span>{item.brand}</span>
                <span>•</span>
                <span>{item.category}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Cantidad: {item.quantity}
                </span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {formatPrice(item.price)} c/u
                </span>
              </div>
            </div>

            {/* Subtotal del producto */}
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de precios */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          Resumen de la compra
        </h4>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Productos ({state.itemCount} {state.itemCount === 1 ? 'artículo' : 'artículos'})
            </span>
            <span className="font-medium">
              {formatPrice(state.total)}
            </span>
          </div>

          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Envío</span>
            <span>Se calculará en el siguiente paso</span>
          </div>

          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Impuestos</span>
            <span>Se calcularán en el siguiente paso</span>
          </div>

          <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-3">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-gray-900 dark:text-white">Subtotal productos</span>
              <span className="text-blue-600 dark:text-blue-400">
                {formatPrice(state.total)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              * El total final se calculará con envío e impuestos
            </p>
          </div>
        </div>

        {/* Mensaje informativo */}
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✨ <strong>Precios transparentes:</strong> El costo final de envío e impuestos se calculará según tu ubicación y método de pago elegido.
          </p>
        </div>
      </div>
    </div>
  )
}
