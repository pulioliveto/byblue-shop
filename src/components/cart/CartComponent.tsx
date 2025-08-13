"use client"

import { useState } from "react"
import CartIcon from "./CartIcon"
import CartSidebar from "./CartSidebar"

export default function CartComponent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      <CartIcon onClick={() => setIsSidebarOpen(true)} />
      <CartSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </>
  )
}
