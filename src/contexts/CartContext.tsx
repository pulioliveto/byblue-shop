"use client"

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { toast } from 'sonner'

// Tipos del carrito
export interface CartItem {
  _id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
  stock: number
  category: string
  brand: string
}

export interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
  isLoading: boolean
}

// Acciones del carrito
type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] }

// Reducer del carrito
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item._id === action.payload._id)
      
      if (existingItem) {
        // Si ya existe, incrementar cantidad
        const newQuantity = existingItem.quantity + 1
        
        if (newQuantity > action.payload.stock) {
          toast.error(`Solo quedan ${action.payload.stock} unidades disponibles`)
          return state
        }
        
        const updatedItems = state.items.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: newQuantity }
            : item
        )
        
        toast.success(`${action.payload.name} (${newQuantity}) actualizado en el carrito`)
        
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems)
        }
      } else {
        // Si no existe, agregar nuevo item
        const { quantity: _, ...itemData } = action.payload as any // Excluir quantity si viene
        const newItem: CartItem = { ...itemData, quantity: 1 }
        const updatedItems = [...state.items, newItem]
        
        toast.success(`${action.payload.name} agregado al carrito`)
        
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems)
        }
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item._id !== action.payload)
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems)
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      
      if (quantity <= 0) {
        // Si la cantidad es 0 o menos, remover el item
        const updatedItems = state.items.filter(item => item._id !== id)
        return {
          ...state,
          items: updatedItems,
          total: calculateTotal(updatedItems),
          itemCount: calculateItemCount(updatedItems)
        }
      }
      
      const updatedItems = state.items.map(item => {
        if (item._id === id) {
          if (quantity > item.stock) {
            toast.error(`Solo quedan ${item.stock} unidades disponibles`)
            return item
          }
          return { ...item, quantity }
        }
        return item
      })
      
      return {
        ...state,
        items: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems)
      }
    }
    
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        total: 0,
        itemCount: 0
      }
    }
    
    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload
      }
    }
    
    case 'LOAD_CART': {
      return {
        ...state,
        items: action.payload,
        total: calculateTotal(action.payload),
        itemCount: calculateItemCount(action.payload),
        isLoading: false
      }
    }
    
    default:
      return state
  }
}

// Funciones helper
function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

function calculateItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0)
}

// Estado inicial
const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  isLoading: false
}

// Contexto
const CartContext = createContext<{
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isInCart: (id: string) => boolean
  getItemQuantity: (id: string) => number
} | null>(null)

// Provider
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('byblue-cart')
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: cartData })
      } catch (error) {
        console.error('Error cargando carrito:', error)
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (!state.isLoading) {
      localStorage.setItem('byblue-cart', JSON.stringify(state.items))
    }
  }, [state.items, state.isLoading])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
    toast.success(`${item.name} agregado al carrito`)
  }

  const removeItem = (id: string) => {
    const item = state.items.find(item => item._id === id)
    dispatch({ type: 'REMOVE_ITEM', payload: id })
    if (item) {
      toast.success(`${item.name} eliminado del carrito`)
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
    toast.success('Carrito vaciado')
  }

  const isInCart = (id: string): boolean => {
    return state.items.some(item => item._id === id)
  }

  const getItemQuantity = (id: string): number => {
    const item = state.items.find(item => item._id === id)
    return item ? item.quantity : 0
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
      getItemQuantity
    }}>
      {children}
    </CartContext.Provider>
  )
}

// Hook para usar el carrito
export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider')
  }
  return context
}
