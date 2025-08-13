import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Category, SortOption } from "@/lib/types/shop"

interface FilterSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: Category[] | SortOption[]
  placeholder: string
  className?: string
}

export default function FilterSelect({ 
  value, 
  onValueChange, 
  options, 
  placeholder,
  className = "w-48"
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`${className} bg-background border-border text-foreground`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-background border-border">
        {options.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value} 
            className="text-foreground hover:bg-muted"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
