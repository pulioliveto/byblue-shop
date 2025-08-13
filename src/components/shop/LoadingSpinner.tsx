export default function LoadingSpinner() {
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
