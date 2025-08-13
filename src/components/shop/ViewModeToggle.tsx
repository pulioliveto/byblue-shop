import { Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ViewMode } from "@/lib/types/shop"

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export default function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  const getButtonClassName = (mode: ViewMode) => {
    return viewMode === mode
      ? "bg-gradient-to-r from-primary to-accent text-white hover:from-primary/90 hover:to-accent/90"
      : "text-muted-foreground hover:text-foreground hover:bg-muted"
  }

  return (
    <div className="flex border border-border rounded-lg overflow-hidden">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className={getButtonClassName("grid")}
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("list")}
        className={getButtonClassName("list")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}
