"use client"

import { X, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/CartContext"
import { formatPrice } from "@/lib/utils"
import CartProductItem from "./CartProductItem"

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { state, clearCart } = useCart()

  if (!isOpen) return null

  const handleCheckout = () => {
    // Aquí implementaremos la lógica de checkout
    console.log('Proceder al checkout con:', state.items)
    // Por ahora solo cerramos el sidebar
    onClose()
  }

  return (
    <>
      {/* Overlay con blur más fuerte */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Sidebar completamente opaco */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 shadow-2xl transform transition-transform duration-300 flex flex-col">
        {/* Header con fondo sólido */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Mi Carrito
                </h2>
                <p className="text-sm text-muted-foreground">
                  {state.itemCount} {state.itemCount === 1 ? 'artículo' : 'artículos'} • {state.items.length} {state.items.length === 1 ? 'producto' : 'productos'}
                </p>
                {state.items.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {state.items.slice(0, 2).map(item => 
                      `${item.name} (${item.quantity})`
                    ).join(', ')}
                    {state.items.length > 2 && ` y ${state.items.length - 2} más...`}
                  </p>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-10 w-10 p-0 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content mejorado */}
        <div className="flex-1 overflow-y-auto">
          {state.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-gray-900">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Tu carrito está vacío
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
                Agrega productos haciendo click en "Agregar al carrito" en cualquier producto
              </p>
              <Button 
                onClick={onClose} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3"
              >
                Explorar productos
              </Button>
            </div>
          ) : (
            <>
              <div className="p-4 bg-white dark:bg-gray-900">
                {/* Resumen detallado de productos con fondo sólido */}
                <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white">Resumen de tu compra</h3>
                    <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
                      {state.items.length} {state.items.length === 1 ? 'producto' : 'productos'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {state.items.map((item, index) => (
                      <div key={item._id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {item.quantity}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white truncate">
                            {item.name}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 text-xs">
                            ({item.brand})
                          </span>
                        </div>
                        <span className="font-bold text-blue-600 dark:text-blue-400 ml-2">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-blue-200 dark:border-blue-700 pt-3 mt-3">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-gray-900 dark:text-white">Total de artículos:</span>
                      <span className="text-lg text-green-600 dark:text-green-400">{state.itemCount}</span>
                    </div>
                  </div>
                </div>
                
                {/* Lista detallada de productos */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
                    Productos en el carrito
                  </h4>
                  {state.items.map((item, index) => (
                    <CartProductItem 
                      key={item._id} 
                      item={item} 
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer con desglose sólido */}
        {state.items.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
            {/* Desglose detallado con fondo sólido */}
            <div className="space-y-3">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-3 space-y-2 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Desglose de compra:</h4>
                
                {state.items.map((item) => (
                  <div key={item._id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total productos ({state.itemCount}):
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatPrice(state.total)}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Envío:</span>
                <span className="font-medium text-green-600 dark:text-green-400">Gratis</span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total final:</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(state.total)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Estás comprando {state.itemCount} {state.itemCount === 1 ? 'artículo' : 'artículos'} de {state.items.length} {state.items.length === 1 ? 'producto diferente' : 'productos diferentes'}
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <Button
                onClick={handleCheckout}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg h-12 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                size="lg"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Comprar {state.itemCount} {state.itemCount === 1 ? 'artículo' : 'artículos'}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={clearCart}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Vaciar
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
