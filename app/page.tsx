"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import {
  Search,
  Film,
  Star,
  Calendar,
  Filter,
  TrendingUp,
  Award,
  Clock,
  Hexagon,
  Zap,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MovieCard from "@/components/movie-card"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"

// Types
interface Movie {
  imdbID: string
  Title: string
  Year: string
  Poster: string
  Type: string
  imdbRating?: string
}

interface MovieSearchResponse {
  Search?: Movie[]
  totalResults?: string
  Response: string
  Error?: string
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([])
  const [recentMovies, setRecentMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState("")
  const [genreFilter, setGenreFilter] = useState("all") // Updated default value
  const [yearRange, setYearRange] = useState([1970, new Date().getFullYear()])
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  // Fetch initial movie data
  useEffect(() => {
    const fetchInitialMovies = async () => {
      setIsLoading(true)
      try {
        // Fetch trending movies (using a popular search term as proxy)
        const trendingResponse = await fetch("/api/movies?search=avengers")
        if (!trendingResponse.ok) {
          throw new Error(`API error: ${trendingResponse.status}`)
        }
        const trendingData: MovieSearchResponse = await trendingResponse.json()

        // Fetch top-rated movies (using another popular search)
        const topRatedResponse = await fetch("/api/movies?search=inception")
        if (!topRatedResponse.ok) {
          throw new Error(`API error: ${topRatedResponse.status}`)
        }
        const topRatedData: MovieSearchResponse = await topRatedResponse.json()

        // Fetch recent movies (using current year)
        const currentYear = new Date().getFullYear()
        const recentResponse = await fetch(`/api/movies?search=2023&year=${currentYear}`)
        if (!recentResponse.ok) {
          throw new Error(`API error: ${recentResponse.status}`)
        }
        const recentData: MovieSearchResponse = await recentResponse.json()

        if (trendingData.Response === "True" && trendingData.Search) {
          setTrendingMovies(trendingData.Search.slice(0, 6))
        } else if (trendingData.Error) {
          console.error("Trending movies error:", trendingData.Error)
        }

        if (topRatedData.Response === "True" && topRatedData.Search) {
          setTopRatedMovies(topRatedData.Search.slice(0, 6))
        } else if (topRatedData.Error) {
          console.error("Top rated movies error:", topRatedData.Error)
        }

        if (recentData.Response === "True" && recentData.Search) {
          setRecentMovies(recentData.Search.slice(0, 6))
        } else if (recentData.Error) {
          console.error("Recent movies error:", recentData.Error)
        }
      } catch (error) {
        console.error("Error fetching initial movies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialMovies()
  }, [])

  // Handle search
  useEffect(() => {
    const searchMovies = async () => {
      if (!debouncedSearchTerm) {
        setSearchResults([])
        setShowSearchResults(false)
        return
      }

      try {
        const response = await fetch(`/api/movies?search=${debouncedSearchTerm}`)
        const data: MovieSearchResponse = await response.json()

        if (data.Response === "True" && data.Search) {
          setSearchResults(data.Search.slice(0, 6))
          setShowSearchResults(true)
        } else {
          setSearchResults([])
        }
      } catch (error) {
        console.error("Error searching movies:", error)
        setSearchResults([])
      }
    }

    searchMovies()
  }, [debouncedSearchTerm])

  const handleMovieClick = (imdbID: string) => {
    router.push(`/movie/${imdbID}`)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm) {
      router.push(`/search?query=${searchTerm}`)
    }
  }

  const handleYearRangeChange = (values: number[]) => {
    setYearRange(values)
  }

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
            <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">LOADING MOVIES</div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-4 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
          <div className="flex items-center space-x-2">
            <Hexagon className="h-8 w-8 text-cyan-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              CINEVERSE
            </span>
          </div>

          <div className="flex items-center space-x-6 relative">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="bg-transparent border-none focus:outline-none text-sm w-40 md:w-64 placeholder:text-slate-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Search results dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800/90 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-2">
                    {searchResults.map((movie) => (
                      <div
                        key={movie.imdbID}
                        className="flex items-center space-x-2 p-2 hover:bg-slate-700/50 rounded-md cursor-pointer"
                        onClick={() => handleMovieClick(movie.imdbID)}
                      >
                        <div className="w-10 h-14 bg-slate-700 rounded overflow-hidden flex-shrink-0">
                          {movie.Poster && movie.Poster !== "N/A" ? (
                            <img
                              src={movie.Poster || "/placeholder.svg"}
                              alt={movie.Title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="h-5 w-5 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-200 truncate">{movie.Title}</div>
                          <div className="text-xs text-slate-400">{movie.Year}</div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 mt-1 border-t border-slate-700/50 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-cyan-400 hover:text-cyan-300"
                        onClick={() => router.push(`/search?query=${searchTerm}`)}
                      >
                        View all results
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </header>

        {/* Hero section */}
        <div className="mb-10">
          <div className="relative rounded-2xl overflow-hidden h-64 md:h-80 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 mix-blend-overlay"></div>
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Discover Your Next Favorite Movie</h1>
              <p className="text-slate-300 max-w-lg mb-6">
                Explore thousands of movies with our futuristic movie database. Filter by year, genre, and more.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Zap className="mr-2 h-4 w-4" />
                  Explore Now
                </Button>
                <Button variant="outline" className="border-slate-500 text-slate-300 hover:bg-slate-800">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Top Rated
                </Button>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-cyan-500/30 blur-3xl"></div>
            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-blue-500/30 blur-3xl"></div>
          </div>
        </div>

        {/* Main content */}
        <div className="mb-10">
          <Tabs defaultValue="trending" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-slate-800/50 p-1">
                <TabsTrigger
                  value="trending"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                >
                  Trending
                </TabsTrigger>
                <TabsTrigger
                  value="top-rated"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                >
                  Top Rated
                </TabsTrigger>
                <TabsTrigger
                  value="recent"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                >
                  Recent Releases
                </TabsTrigger>
              </TabsList>

              <Button
                variant="ghost"
                className="text-slate-400 hover:text-slate-100"
                onClick={() => router.push("/explore")}
              >
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <TabsContent value="trending" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {trendingMovies.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} onClick={() => handleMovieClick(movie.imdbID)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="top-rated" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {topRatedMovies.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} onClick={() => handleMovieClick(movie.imdbID)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {recentMovies.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} onClick={() => handleMovieClick(movie.imdbID)} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Filters section */}
        <div className="mb-10">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-slate-100 flex items-center">
                <Filter className="mr-2 h-5 w-5 text-cyan-500" />
                Explore by Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Year Range</label>
                  <div className="mb-2">
                    <Slider
                      defaultValue={yearRange}
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
                  <label className="text-sm text-slate-400 mb-2 block">Genre</label>
                  <Select value={genreFilter} onValueChange={setGenreFilter}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All Genres</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
                      <SelectItem value="adventure">Adventure</SelectItem>
                      <SelectItem value="comedy">Comedy</SelectItem>
                      <SelectItem value="drama">Drama</SelectItem>
                      <SelectItem value="horror">Horror</SelectItem>
                      <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                      <SelectItem value="thriller">Thriller</SelectItem>
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

              <div className="mt-6 flex justify-end">
                <Button className="bg-cyan-600 hover:bg-cyan-700">Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Film className="mr-2 h-5 w-5 text-cyan-500" />
            Explore by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <CategoryCard icon={<Star className="h-6 w-6 text-amber-500" />} title="Action" />
            <CategoryCard icon={<Award className="h-6 w-6 text-purple-500" />} title="Drama" />
            <CategoryCard icon={<TrendingUp className="h-6 w-6 text-green-500" />} title="Comedy" />
            <CategoryCard icon={<Clock className="h-6 w-6 text-blue-500" />} title="Sci-Fi" />
            <CategoryCard icon={<Calendar className="h-6 w-6 text-red-500" />} title="Horror" />
            <CategoryCard icon={<Film className="h-6 w-6 text-cyan-500" />} title="Thriller" />
          </div>
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

// Category card component
function CategoryCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-pointer group">
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <div className="mb-2 transform group-hover:scale-110 transition-transform">{icon}</div>
        <div className="text-sm font-medium text-slate-300 group-hover:text-cyan-400 transition-colors">{title}</div>
      </CardContent>
    </Card>
  )
}
