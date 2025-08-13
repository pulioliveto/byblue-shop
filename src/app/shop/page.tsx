"use client"

import { useState, useEffect } from "react"
import { Search, Grid, List, ShoppingCart, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: string
  subcategory?: string
  brand: string
  images: string[]
  stock: number
  tags: string[]
  isActive: boolean
  createdAt: string
  hasDiscount?: boolean
  discountPercentage?: number
}

const categories = [
  { value: "all", label: "Todas las categorías" },
  { value: "smartphones", label: "Smartphones" },
  { value: "laptops", label: "Laptops" },
  { value: "tablets", label: "Tablets" },
  { value: "accesorios", label: "Accesorios" },
  { value: "audio", label: "Audio" },
  { value: "gaming", label: "Gaming" },
  { value: "smart-tv", label: "Smart TV" },
  { value: "otros", label: "Otros" },
]

const sortOptions = [
  { value: "newest", label: "Más recientes" },
  { value: "price-asc", label: "Precio: Menor a mayor" },
  { value: "price-desc", label: "Precio: Mayor a menor" },
  { value: "name-asc", label: "Nombre: A-Z" },
  { value: "name-desc", label: "Nombre: Z-A" },
]

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        console.log("Products received:", data.data)
        console.log("Number of products:", data.data?.length)
        setProducts(data.data || [])
        setFilteredProducts(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("Total products:", products.length)
    let filtered = products.filter((product) => product.isActive)
    console.log("Active products:", filtered.length)

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filtrar por categoría
    if (selectedCategory && selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Ordenar
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
        break
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory, sortBy])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

  const ProductCard = ({ product, index }: { product: Product; index: number }) => (
    <Card
      className="group relative overflow-hidden bg-background/95 backdrop-blur-sm border-border hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 w-full max-w-[320px] mx-auto"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "fadeInUp 0.6s ease-out forwards",
      }}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary/5 to-accent/10">
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

      <CardFooter className="p-6 pt-0">
        <Button
          size="default"
          className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:bg-muted disabled:text-muted-foreground transform hover:scale-[1.02]"
          disabled={product.stock === 0}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
        </Button>
      </CardFooter>
    </Card>
  )

  const ProductListItem = ({ product, index }: { product: Product; index: number }) => (
    <Card
      className="p-6 bg-background/95 backdrop-blur-sm border-border hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "fadeInUp 0.6s ease-out forwards",
      }}
    >
      <div className="flex gap-6">
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
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs border-primary/30 text-primary bg-primary/10 font-medium">
                  {categories.find((cat) => cat.value === product.category)?.label}
                </Badge>
                {product.subcategory && (
                  <Badge variant="outline" className="text-xs border-border text-muted-foreground bg-muted/50">
                    {product.subcategory}
                  </Badge>
                )}
              </div>

              <h3 className="text-xl font-semibold text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
              <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">{product.description}</p>

              {product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.tags.slice(0, 5).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs bg-muted/50 text-muted-foreground border-border font-medium"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right space-y-4">
              {product.hasDiscount && (
                <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 font-semibold">-{product.discountPercentage}%</Badge>
              )}

              <div className="flex flex-col items-end">
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through font-medium">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{formatPrice(product.price)}</span>
              </div>

              <Button
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:bg-muted disabled:text-muted-foreground"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-muted border-t-primary shadow-lg"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Tienda ByBlue
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Descubre nuestra colección exclusiva de tecnología premium
          </p>
        </div>

        <div className="bg-background/80 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 bg-background border-border text-foreground placeholder-muted-foreground focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex gap-4 w-full lg:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48 bg-background border-border text-foreground">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value} className="text-foreground hover:bg-muted">
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-background border-border text-foreground">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-foreground hover:bg-muted">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex border border-border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={
                    viewMode === "grid"
                      ? "bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={
                    viewMode === "list"
                      ? "bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground font-medium">
            Mostrando <span className="text-primary font-semibold">{filteredProducts.length}</span> de{" "}
            <span className="text-primary font-semibold">{products.filter((p) => p.isActive).length}</span> productos
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold mb-4 text-foreground">No se encontraron productos</h3>
            <p className="text-muted-foreground text-lg">Intenta ajustar tus filtros de búsqueda</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="flex justify-center">
            <div className="grid gap-8 max-w-7xl" style={{
              gridTemplateColumns: `repeat(${Math.min(filteredProducts.length, 4)}, minmax(280px, 320px))`,
              justifyContent: filteredProducts.length === 1 ? 'center' : 
                           filteredProducts.length === 2 ? 'center' : 
                           filteredProducts.length === 3 ? 'center' : 'start'
            }}>
              {filteredProducts.map((product, index) => (
                <ProductCard key={product._id} product={product} index={index} />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-6xl mx-auto">
            {filteredProducts.map((product, index) => (
              <ProductListItem key={product._id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
