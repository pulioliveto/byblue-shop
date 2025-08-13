import { useState } from "react"
import { ViewMode } from "@/lib/types/shop"

export function useViewMode(initialMode: ViewMode = "grid") {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode)

  return { viewMode, setViewMode }
}
