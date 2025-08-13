import { ViewMode, Category, SortOption } from "@/lib/types/shop"
import SearchBar from "./SearchBar"
import FilterSelect from "./FilterSelect"
import ViewModeToggle from "./ViewModeToggle"

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: string
  onCategoryChange: (value: string) => void
  sortBy: string
  onSortChange: (value: string) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  categories: Category[]
  sortOptions: SortOption[]
}

export default function FilterBar({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  categories,
  sortOptions
}: FilterBarProps) {
  return (
    <div className="bg-background/80 backdrop-blur-sm border border-border p-6 rounded-2xl shadow-lg mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <SearchBar 
          searchTerm={searchTerm} 
          onSearchChange={onSearchChange} 
        />

        <div className="flex gap-4 w-full lg:w-auto">
          <FilterSelect
            value={selectedCategory}
            onValueChange={onCategoryChange}
            options={categories}
            placeholder="Categoría"
          />

          <FilterSelect
            value={sortBy}
            onValueChange={onSortChange}
            options={sortOptions}
            placeholder="Ordenar por"
          />

          <ViewModeToggle 
            viewMode={viewMode} 
            onViewModeChange={onViewModeChange} 
          />
        </div>
      </div>
    </div>
  )
}
