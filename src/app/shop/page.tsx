"use client"

import { categories, sortOptions } from "@/lib/config/shop"
import { filterActiveProducts } from "@/lib/utils/shop/productFilters"
import { useProducts } from "@/hooks/useProducts"
import { useProductFilters } from "@/hooks/useProductFilters"
import { useViewMode } from "@/hooks/useViewMode"

import LoadingSpinner from "@/components/shop/LoadingSpinner"
import ShopHeader from "@/components/shop/ShopHeader"
import FilterBar from "@/components/shop/FilterBar"
import ProductStats from "@/components/shop/ProductStats"
import EmptyState from "@/components/shop/EmptyState"
import ProductGrid from "@/components/shop/ProductGrid"
import ProductList from "@/components/shop/ProductList"

export default function ShopPage() {
  const { products, loading } = useProducts()
  const { viewMode, setViewMode } = useViewMode()
  const {
    filteredProducts,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy
  } = useProductFilters(products)

  const activeProductsCount = filterActiveProducts(products).length

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="container mx-auto px-4 py-8 pt-20">
        <ShopHeader />

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          categories={categories}
          sortOptions={sortOptions}
        />

        <ProductStats 
          filteredCount={filteredProducts.length}
          totalCount={activeProductsCount}
        />

        {filteredProducts.length === 0 ? (
          <EmptyState />
        ) : viewMode === "grid" ? (
          <ProductGrid products={filteredProducts} categories={categories} />
        ) : (
          <ProductList products={filteredProducts} categories={categories} />
        )}
      </div>
    </div>
  )
}