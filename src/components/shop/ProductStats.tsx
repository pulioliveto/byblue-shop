interface ProductStatsProps {
  filteredCount: number
  totalCount: number
}

export default function ProductStats({ filteredCount, totalCount }: ProductStatsProps) {
  return (
    <div className="mb-6 flex justify-between items-center">
      <p className="text-muted-foreground font-medium">
        Mostrando <span className="text-primary font-semibold">{filteredCount}</span> de{" "}
        <span className="text-primary font-semibold">{totalCount}</span> productos
      </p>
    </div>
  )
}
