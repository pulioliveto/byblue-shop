"use client"

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/CartContext"

interface CartIconProps {
  onClick?: () => void
}

export default function CartIcon({ onClick }: CartIconProps) {
  const { state } = useCart()

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2 hover:bg-primary/10 transition-colors duration-200"
        onClick={onClick}
      >
        <ShoppingCart className="h-5 w-5 text-foreground" />
        {state.itemCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold animate-pulse"
          >
            {state.itemCount > 99 ? '99+' : state.itemCount}
          </Badge>
        )}
      </Button>

      {/* Tooltip con información detallada */}
      {state.itemCount > 0 && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-background/95 backdrop-blur-xl border border-primary/20 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-foreground">Vista rápida del carrito</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                {state.itemCount} {state.itemCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>
            
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {state.items.slice(0, 3).map((item) => (
                <div key={item._id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <span className="w-4 h-4 bg-primary/20 text-primary rounded-full flex items-center justify-center text-[10px] font-bold">
                      {item.quantity}
                    </span>
                    <span className="truncate font-medium">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-primary ml-2">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              
              {state.items.length > 3 && (
                <div className="text-xs text-muted-foreground text-center py-1">
                  y {state.items.length - 3} producto{state.items.length - 3 === 1 ? '' : 's'} más...
                </div>
              )}
            </div>
            
            <div className="border-t border-border/30 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total:</span>
                <span className="text-sm font-bold text-accent">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(state.total)}
                </span>
              </div>
            </div>
            
            <div className="text-center mt-2">
              <span className="text-xs text-muted-foreground">Click para ver todos los detalles</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
