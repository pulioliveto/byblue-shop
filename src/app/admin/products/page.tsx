"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Package, Edit, Trash2, Search, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  brand: string;
  images: string[];
  stock: number;
  isActive: boolean;
  tags: string[];
  specifications: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'accesorios', label: 'Accesorios' },
];

const subcategories = {
  smartphones: ['iPhone', 'Samsung', 'Xiaomi', 'Google Pixel', 'OnePlus'],
  laptops: ['MacBook', 'Dell', 'HP', 'Lenovo', 'ASUS'],
  accesorios: ['AirPods', 'Cargadores', 'Fundas', 'Cables', 'Soportes']
};

export default function ProductsManagementPage() {
  const { user, isLoading, hasAdminPrivileges } = useAuth();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subcategory: '',
    brand: '',
    images: [''],
    stock: '',
    tags: '',
    specifications: ''
  });

  useEffect(() => {
    if (!isLoading && !hasAdminPrivileges) {
      router.push('/');
      return;
    }
    
    if (hasAdminPrivileges) {
      fetchProducts();
    }
  }, [isLoading, hasAdminPrivileges, router]);

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        category: formData.category,
        subcategory: formData.subcategory,
        brand: formData.brand,
        images: formData.images.filter(img => img.trim() !== ''),
        stock: parseInt(formData.stock),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
        isActive: true
      };

      const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        await fetchProducts(); // Recargar la lista
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          originalPrice: '',
          category: '',
          subcategory: '',
          brand: '',
          images: [''],
          stock: '',
          tags: '',
          specifications: ''
        });
        
        setShowCreateForm(false);
        setEditingProduct(null);
        alert(editingProduct ? 'Producto actualizado exitosamente!' : 'Producto creado exitosamente!');
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear el producto');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error al crear el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset subcategory when category changes
    if (field === 'category') {
      setFormData(prev => ({ ...prev, subcategory: '' }));
    }
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const updateImageField = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const removeImageField = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    setDeletingProductId(productId);
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProducts(); // Recargar la lista
        alert('Producto eliminado exitosamente');
      } else {
        throw new Error('Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el producto');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      category: product.category,
      subcategory: product.subcategory || '',
      brand: product.brand,
      images: product.images,
      stock: product.stock.toString(),
      tags: product.tags.join(', '),
      specifications: Object.entries(product.specifications || {})
        .map(([key, value]) => `${key}:${value}`)
        .join('\n')
    });
    setShowCreateForm(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return <div className="p-8">Cargando...</div>;
  }

  if (!hasAdminPrivileges) {
    return null;
  }

  return (
    <div className="pt-20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Gestión de Productos
            </h1>
            <p className="text-muted-foreground mt-2">
              Administra el catálogo de productos de la tienda
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        {/* Create Product Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="glass-effect border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nombre del Producto *</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="iPhone 15 Pro Max"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Marca *</label>
                      <Input
                        required
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        placeholder="Apple"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Categoría *</label>
                      <Select
                        required
                        value={formData.category}
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Subcategoría *</label>
                      <Select
                        required
                        value={formData.subcategory}
                        onValueChange={(value) => handleInputChange('subcategory', value)}
                        disabled={!formData.category}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una subcategoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.category && subcategories[formData.category as keyof typeof subcategories]?.map((subcat) => (
                            <SelectItem key={subcat} value={subcat}>
                              {subcat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Price and Stock */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Precio (USD) *</label>
                      <Input
                        required
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="999.99"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Precio Original (Descuento)</label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.originalPrice}
                        onChange={(e) => handleInputChange('originalPrice', e.target.value)}
                        placeholder="1299.99"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Cantidad en Stock *</label>
                      <Input
                        required
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => handleInputChange('stock', e.target.value)}
                        placeholder="50"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tags</label>
                    <Input
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="smartphone, apple, tecnología"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Separa los tags con comas
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Descripción *</label>
                    <Textarea
                      required
                      value={formData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                      placeholder="Descripción detallada del producto..."
                      rows={4}
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Imágenes del Producto</label>
                    <div className="space-y-2">
                      {formData.images.map((image, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={image}
                            onChange={(e) => updateImageField(index, e.target.value)}
                            placeholder="URL de la imagen"
                          />
                          {formData.images.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeImageField(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addImageField}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Imagen
                      </Button>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Especificaciones (JSON)</label>
                    <Textarea
                      value={formData.specifications}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('specifications', e.target.value)}
                      placeholder='{"pantalla": "6.7 pulgadas", "almacenamiento": "256GB", "camara": "48MP"}'
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Formato JSON válido para especificaciones técnicas
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingProduct(null);
                        setFormData({
                          name: '',
                          description: '',
                          price: '',
                          originalPrice: '',
                          category: '',
                          subcategory: '',
                          brand: '',
                          images: [''],
                          stock: '',
                          tags: '',
                          specifications: ''
                        });
                      }}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    >
                      {isSubmitting 
                        ? (editingProduct ? 'Actualizando...' : 'Creando...') 
                        : (editingProduct ? 'Actualizar Producto' : 'Crear Producto')
                      }
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {isLoadingProducts ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Cargando productos...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || filterCategory !== 'all' ? 'No se encontraron productos' : 'No hay productos creados aún'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="glass-effect border-primary/20 hover:border-primary/40 transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={product.isActive ? "default" : "secondary"}>
                          {product.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                          {product.stock > 0 ? "En Stock" : "Agotado"}
                        </Badge>
                      </div>
                      
                      {product.images[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-product.png';
                          }}
                        />
                      )}
                      
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>
                      
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-2xl font-bold text-primary">
                          ${product.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Stock: {product.stock}
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleDeleteProduct(product._id)}
                          disabled={deletingProductId === product._id}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {deletingProductId === product._id ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
