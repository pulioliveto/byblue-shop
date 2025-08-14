"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useRefreshSession } from "@/hooks/useRefreshSession"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ShoppingBag, Search, Menu, X, User } from "lucide-react"
import { useState } from "react"
import CartComponent from "./cart/CartComponent"

export default function Navbar() {
  const { user, isLoading, isAuthenticated, isAdmin, isCreador, hasAdminPrivileges, hasCreadorPrivileges } = useAuth()
  const { refreshSession } = useRefreshSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  const handleRefreshSession = async () => {
    console.log("Iniciando actualización de sesión...")
    const updatedSession = await refreshSession()
    if (updatedSession) {
      console.log("Sesión actualizada exitosamente")
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center animate-glow">
                <span className="text-white font-bold text-sm">BB</span>
              </div>
              <span className="font-heading font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ByBlue Shop
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/shop"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Tienda
            </Link>
            <Link
              href="/shop/smartphones"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Smartphones
            </Link>
            <Link
              href="/shop/laptops"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Laptops
            </Link>
            <Link
              href="/shop/accesorios"
              className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium"
            >
              Accesorios
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Button */}
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Search className="w-4 h-4" />
            </Button>

            {isLoading ? (
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                {/* Cart Component */}
                <CartComponent />

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/50 transition-all p-0"
                    >
                      {user.image && !imageError ? (
                        <Image
                          className="rounded-full object-cover w-full h-full"
                          src={user.image}
                          alt={user.name || 'User avatar'}
                          width={40}
                          height={40}
                          onError={() => {
                            console.log('Image error, showing fallback');
                            setImageError(true);
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully');
                            setImageError(false);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                          {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-effect" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center space-x-3">
                        {user.image && !imageError ? (
                          <Image
                            className="rounded-full object-cover"
                            src={user.image}
                            alt={user.name}
                            width={40}
                            height={40}
                            onError={() => setImageError(true)}
                            onLoad={() => setImageError(false)}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold shadow-md">
                            {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                          </div>
                        )}
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          <p className="text-xs leading-none text-muted-foreground font-medium">
                            {user.role === 'CREADOR' ? '👑 Creador' : user.role === 'ADMIN' ? '🛠️ Admin' : '👤 Usuario'}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Mi Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">📦 Mis Órdenes</Link>
                    </DropdownMenuItem>
                    {hasCreadorPrivileges && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/orders">🛠️ Todas las Órdenes</Link>
                      </DropdownMenuItem>
                    )}

                    {hasAdminPrivileges && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Administración</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Panel Admin</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/products">Gestionar Productos</Link>
                        </DropdownMenuItem>
                      </>
                    )}

                    {hasCreadorPrivileges && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Gestión de Roles</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/users">👤 Gestionar Usuarios</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/roles">⚙️ Configurar Roles</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/permissions">🔐 Ver Permisos</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleRefreshSession}>🔄 Actualizar Sesión</DropdownMenuItem>

                    <DropdownMenuItem onClick={handleSignOut}>Cerrar Sesión</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10 bg-transparent">
                  <Link href="/auth/signin">Iniciar Sesión</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-primary/20">
            <Link href="/shop" className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors">
              Tienda
            </Link>
            <Link
              href="/shop/smartphones"
              className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
            >
              Smartphones
            </Link>
            <Link
              href="/shop/laptops"
              className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
            >
              Laptops
            </Link>
            <Link
              href="/shop/accesorios"
              className="block px-3 py-2 text-muted-foreground hover:text-primary transition-colors"
            >
              Accesorios
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
