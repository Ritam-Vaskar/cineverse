"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Film, Filter, Star, Hexagon, ArrowLeft, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MovieCard from "@/components/movie-card"

// Types
interface Movie {
  imdbID: string
  Title: string
  Year: string
  Poster: string
  Type: string
}

interface MovieSearchResponse {
  Search?: Movie[]
  totalResults?: string
  Response: string
  Error?: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [movies, setMovies] = useState<Movie[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [yearRange, setYearRange] = useState([1900, new Date().getFullYear()])
  const [genreFilter, setGenreFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Get search query from URL
  useEffect(() => {
    const query = searchParams.get("query")
    if (query) {
      setSearchTerm(query)
    }
  }, [searchParams])

  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: Particle[] = []
    const particleCount = 100

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.color = `rgba(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 100) + 150}, ${Math.floor(Math.random() * 55) + 200}, ${Math.random() * 0.5 + 0.2})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        if (!ctx) return
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function animate() {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const particle of particles) {
        particle.update()
        particle.draw()
      }

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Search for movies
  useEffect(() => {
    const searchMovies = async () => {
      if (!searchTerm) return

      setIsLoading(true)
      try {
        let url = `/api/movies?search=${searchTerm}&page=${currentPage}`

        // Add year filter if both values are set
        if (yearRange[0] !== 1900 || yearRange[1] !== new Date().getFullYear()) {
          // OMDb API only supports filtering by a single year, so we'll use the start year
          url += `&year=${yearRange[0]}`
        }

        // Add type filter
        if (typeFilter) {
          url += `&type=${typeFilter}`
        }

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        const data: MovieSearchResponse = await response.json()

        if (data.Response === "True" && data.Search) {
          setMovies(data.Search)
          setTotalResults(Number.parseInt(data.totalResults || "0"))
        } else {
          setMovies([])
          setTotalResults(0)
          if (data.Error) {
            console.error("Search error:", data.Error)
          }
        }
      } catch (error) {
        console.error("Error searching movies:", error)
        setMovies([])
        setTotalResults(0)
      } finally {
        setIsLoading(false)
      }
    }

    searchMovies()
  }, [searchTerm, currentPage, yearRange, typeFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    router.push(`/search?query=${searchTerm}`)
  }

  const handleMovieClick = (imdbID: string) => {
    router.push(`/movie/${imdbID}`)
  }

  const handleYearRangeChange = (values: number[]) => {
    setYearRange(values)
  }

  const handleClearFilters = () => {
    setYearRange([1900, new Date().getFullYear()])
    setGenreFilter("")
    setTypeFilter("")
  }

  const totalPages = Math.ceil(totalResults / 10)

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden">
      {/* Background particle effect */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-r-purple-500 border-t-transparent border-b-transparent border-l-transparent rounded-full animate-spin-slow"></div>
              <div className="absolute inset-6 border-4 border-b-blue-500 border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin-slower"></div>
              <div className="absolute inset-8 border-4 border-l-green-500 border-t-transparent border-r-transparent border-b-transparent rounded-full animate-spin"></div>
            </div>
            <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">SEARCHING MOVIES</div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-100"
              onClick={() => router.push("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Hexagon className="h-6 w-6 text-cyan-500" />
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                CINEVERSE
              </span>
            </div>
          </div>
        </header>

        {/* Search bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-cyan-500"
              />
            </div>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </form>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm mb-6">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-slate-100 flex items-center">
                <Filter className="mr-2 h-5 w-5 text-cyan-500" />
                Search Filters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-100"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Year Range</label>
                  <div className="mb-2">
                    <Slider
                      value={yearRange}
                      min={1900}
                      max={new Date().getFullYear()}
                      step={1}
                      onValueChange={handleYearRangeChange}
                      className="my-4"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{yearRange[0]}</span>
                    <span>{yearRange[1]}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="movie">Movies</SelectItem>
                      <SelectItem value="series">TV Series</SelectItem>
                      <SelectItem value="episode">Episodes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Rating</label>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800 hover:bg-slate-700">
                      <Star className="mr-1 h-3 w-3 text-amber-500" /> 7+
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800 hover:bg-slate-700">
                      <Star className="mr-1 h-3 w-3 text-amber-500" /> 8+
                    </Button>
                    <Button variant="outline" size="sm" className="border-slate-700 bg-slate-800 hover:bg-slate-700">
                      <Star className="mr-1 h-3 w-3 text-amber-500" /> 9+
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
                <Button className="bg-cyan-600 hover:bg-cyan-700">Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search results */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Search className="mr-2 h-5 w-5 text-cyan-500" />
              Search Results {totalResults > 0 && `(${totalResults})`}
            </h2>

            {movies.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Sort by:</span>
                <Select defaultValue="relevance">
                  <SelectTrigger className="bg-slate-800 border-slate-700 w-32 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="year-desc">Year (Newest)</SelectItem>
                    <SelectItem value="year-asc">Year (Oldest)</SelectItem>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {movies.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {movies.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} onClick={() => handleMovieClick(movie.imdbID)} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum =
                          currentPage > 3
                            ? i + currentPage - 2 <= totalPages
                              ? i + currentPage - 2
                              : totalPages - 4 + i
                            : i + 1

                        if (pageNum <= 0 || pageNum > totalPages) return null

                        return (
                          <Button
                            key={i}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            className={
                              currentPage === pageNum
                                ? "bg-cyan-600 hover:bg-cyan-700"
                                : "border-slate-700 text-slate-300 hover:bg-slate-800"
                            }
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="text-slate-500">...</span>
                          <Button
                            variant="outline"
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-8 text-center">
              {searchTerm ? (
                <>
                  <Film className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">No movies found</h3>
                  <p className="text-slate-400 mb-4">We couldn't find any movies matching "{searchTerm}".</p>
                  <Button
                    variant="outline"
                    className="border-slate-700 text-slate-300 hover:bg-slate-700"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <>
                  <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">Search for movies</h3>
                  <p className="text-slate-400">Enter a movie title, actor, or keyword to find movies.</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-slate-700/50 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Hexagon className="h-6 w-6 text-cyan-500" />
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                CINEVERSE
              </span>
            </div>
            <div className="text-sm text-slate-400">
              Powered by OMDb API • Designed with ❤️ • {new Date().getFullYear()}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
