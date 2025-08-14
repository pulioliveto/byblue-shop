"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Plus, 
  Minus,
  Truck,
  Shield,
  RotateCcw,
  Zap,
  CheckCircle,
  MessageSquare
} from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/contexts/CartContext"

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
  variants?: {
    colors: { name: string; hex: string; stock: number }[]
    models: { name: string; price: number; stock: number }[]
  }
  specifications?: { [key: string]: string }
  features?: string[]
}

interface Review {
  _id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  createdAt: string
  verified: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const { user, isAuthenticated } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedModel, setSelectedModel] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isWishlist, setIsWishlist] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (params?.id) {
      fetchProduct()
      fetchReviews()
    }
  }, [params?.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params?.id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data.data)
        // Establecer valores por defecto
        if (data.data.variants?.colors?.length > 0) {
          setSelectedColor(data.data.variants.colors[0].name)
        }
        if (data.data.variants?.models?.length > 0) {
          setSelectedModel(data.data.variants.models[0].name)
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${params?.id}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    // Verificar stock disponible
    if (product.stock <= 0) {
      console.log("Producto sin stock")
      return
    }

    // Construir el item para agregar al carrito (SIN quantity - el carrito la maneja internamente)
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images?.[0] || '',
      brand: product.brand,
      category: product.category,
      stock: product.stock,
      // Agregar variantes seleccionadas si existen
      ...(selectedColor && { selectedColor }),
      ...(selectedModel && { selectedModel })
    }

    // Agregar al carrito la cantidad especificada (hacer múltiples llamadas si es necesario)
    for (let i = 0; i < quantity; i++) {
      addItem(cartItem)
    }
  }

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !newReview.comment.trim()) return
    
    setSubmittingReview(true)
    try {
      const response = await fetch(`/api/products/${params?.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview)
      })
      
      if (response.ok) {
        setNewReview({ rating: 5, comment: "" })
        fetchReviews()
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setSubmittingReview(false)
    }
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const getCurrentPrice = () => {
    let basePrice = product?.price || 0
    if (selectedModel && product?.variants?.models) {
      const model = product.variants.models.find(m => m.name === selectedModel)
      if (model) basePrice = model.price
    }
    return basePrice
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(price)
  }

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

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-foreground mb-4">Producto no encontrado</h1>
            <p className="text-muted-foreground mb-8">El producto que buscas no existe o ha sido eliminado.</p>
            <Link href="/shop">
              <Button className="bg-gradient-to-r from-primary to-accent text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a la tienda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8 pt-20">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/shop" className="hover:text-primary transition-colors">Tienda</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} className="hover:text-primary transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Galería de Imágenes */}
          <div className="space-y-4">
            <div className="relative w-full h-96 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-accent/10">
              <Image
                src={product.images[selectedImageIndex] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain p-6"
              />
              {product.hasDiscount && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white">
                  -{product.discountPercentage}% OFF
                </Badge>
              )}
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative w-full h-20 overflow-hidden rounded-lg border-2 transition-all ${
                      selectedImageIndex === index 
                        ? "border-primary shadow-lg" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-contain p-2"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/10">
                {product.brand}
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(Number(getAverageRating()))
                          ? "text-yellow-400 fill-current"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {getAverageRating()} ({reviews.length} reseñas)
                  </span>
                </div>
              </div>

              {/* Precio */}
              <div className="flex items-center gap-4 mb-6">
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formatPrice(getCurrentPrice())}
                </span>
              </div>

              {/* Información de MercadoPago */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    {/* Logo de MercadoPago */}
                    <svg className="w-8 h-8" viewBox="0 0 200 80" fill="none">
                      <rect width="200" height="80" fill="#00A8FF"/>
                      <path d="M20 20h160v40H20z" fill="white"/>
                      <text x="100" y="45" textAnchor="middle" fontSize="16" fill="#00A8FF" fontWeight="bold">
                        MercadoPago
                      </text>
                    </svg>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      Pagar con MercadoPago
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <Shield className="w-4 h-4" />
                      <span>Compra protegida</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <span>💳</span>
                      <span>Todas las tarjetas</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <span>💰</span>
                      <span>Efectivo disponible</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                      <span>🏦</span>
                      <span>Hasta 12 cuotas sin interés</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            {/* Variantes */}
            <div className="space-y-6">
              {/* Colores */}
              {product.variants?.colors && product.variants.colors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Color</h3>
                  <div className="flex gap-3">
                    {product.variants.colors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
                          selectedColor === color.name
                            ? "border-primary shadow-lg scale-110"
                            : "border-border hover:border-primary/50"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Seleccionado: {selectedColor}
                  </p>
                </div>
              )}

              {/* Modelos */}
              {product.variants?.models && product.variants.models.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Modelo</h3>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {product.variants.models.map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          {model.name} - {formatPrice(model.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Cantidad */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Cantidad</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.stock} disponibles
                  </span>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold h-14"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
              </Button>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={() => setIsWishlist(!isWishlist)}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isWishlist ? "fill-current text-red-500" : ""}`} />
                  Favoritos
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Share2 className="w-5 h-5 mr-2" />
                  Compartir
                </Button>
              </div>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg">
                <Truck className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Envío gratis</p>
                  <p className="text-xs text-muted-foreground">En 24-48hs</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Garantía</p>
                  <p className="text-xs text-muted-foreground">12 meses</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-background/50 rounded-lg">
                <RotateCcw className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Devolución</p>
                  <p className="text-xs text-muted-foreground">30 días</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs con Detalles */}
        <Tabs defaultValue="description" className="mb-12">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Descripción</TabsTrigger>
            <TabsTrigger value="specifications">Especificaciones</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Descripción del producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
                {product.features && product.features.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Características destacadas:</h4>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Especificaciones técnicas</CardTitle>
              </CardHeader>
              <CardContent>
                {product.specifications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-border">
                        <span className="font-medium">{key}:</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay especificaciones disponibles.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Formulario de nueva reseña */}
              {isAuthenticated && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Escribir una reseña
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Calificación</label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="transition-colors"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newReview.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Comentario</label>
                      <Textarea
                        placeholder="Comparte tu experiencia con este producto..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !newReview.comment.trim()}
                      className="bg-gradient-to-r from-primary to-accent text-white"
                    >
                      {submittingReview ? "Enviando..." : "Enviar reseña"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Lista de reseñas */}
              <Card>
                <CardHeader>
                  <CardTitle>Reseñas de usuarios</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Aún no hay reseñas. ¡Sé el primero en dejar una!
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review._id} className="border-b border-border pb-6 last:border-b-0">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold">{review.userName}</h4>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                          key={star}
                                          className={`w-4 h-4 ${
                                            star <= review.rating
                                              ? "text-yellow-400 fill-current"
                                              : "text-muted-foreground"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    {review.verified && (
                                      <Badge variant="secondary" className="text-xs">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Compra verificada
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
