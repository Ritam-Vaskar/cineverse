"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Film, Calendar, Star, Hexagon, ArrowLeft, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

// Genre categories
const genres = [
  { name: "Action", query: "action" },
  { name: "Adventure", query: "adventure" },
  { name: "Animation", query: "animation" },
  { name: "Biography", query: "biography" },
  { name: "Comedy", query: "comedy" },
  { name: "Crime", query: "crime" },
  { name: "Documentary", query: "documentary" },
  { name: "Drama", query: "drama" },
  { name: "Family", query: "family" },
  { name: "Fantasy", query: "fantasy" },
  { name: "Horror", query: "horror" },
  { name: "Mystery", query: "mystery" },
  { name: "Romance", query: "romance" },
  { name: "Sci-Fi", query: "sci-fi" },
  { name: "Thriller", query: "thriller" },
  { name: "War", query: "war" },
  { name: "Western", query: "western" },
]

// Decades
const decades = [
  { name: "2020s", start: 2020, end: new Date().getFullYear() },
  { name: "2010s", start: 2010, end: 2019 },
  { name: "2000s", start: 2000, end: 2009 },
  { name: "1990s", start: 1990, end: 1999 },
  { name: "1980s", start: 1980, end: 1989 },
  { name: "1970s", start: 1970, end: 1979 },
  { name: "1960s", start: 1960, end: 1969 },
  { name: "1950s", start: 1950, end: 1959 },
  { name: "Classic", start: 1900, end: 1949 },
]

export default function ExplorePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("trending")
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([])
  const [genreMovies, setGenreMovies] = useState<{ [key: string]: Movie[] }>({})
  const [decadeMovies, setDecadeMovies] = useState<{ [key: string]: Movie[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState("action")
  const [selectedDecade, setSelectedDecade] = useState("2020s")
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
        // Fetch trending movies
        const trendingResponse = await fetch("/api/movies?search=avengers")
        if (!trendingResponse.ok) {
          throw new Error(`API error: ${trendingResponse.status}`)
        }
        const trendingData: MovieSearchResponse = await trendingResponse.json()

        // Fetch top-rated movies
        const topRatedResponse = await fetch("/api/movies?search=godfather")
        if (!topRatedResponse.ok) {
          throw new Error(`API error: ${topRatedResponse.status}`)
        }
        const topRatedData: MovieSearchResponse = await topRatedResponse.json()

        if (trendingData.Response === "True" && trendingData.Search) {
          setTrendingMovies(trendingData.Search.slice(0, 10))
        } else if (trendingData.Error) {
          console.error("Trending movies error:", trendingData.Error)
        }

        if (topRatedData.Response === "True" && topRatedData.Search) {
          setTopRatedMovies(topRatedData.Search.slice(0, 10))
        } else if (topRatedData.Error) {
          console.error("Top rated movies error:", topRatedData.Error)
        }
      } catch (error) {
        console.error("Error fetching initial movies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialMovies()
  }, [])

  // Fetch genre movies when selected genre changes
  useEffect(() => {
    const fetchGenreMovies = async () => {
      if (!selectedGenre) return

      if (genreMovies[selectedGenre]) {
        // Already fetched this genre
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/movies?search=${selectedGenre}`)
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        const data: MovieSearchResponse = await response.json()

        if (data.Response === "True" && data.Search) {
          setGenreMovies((prev) => ({
            ...prev,
            [selectedGenre]: data.Search.slice(0, 10),
          }))
        } else if (data.Error) {
          console.error(`${selectedGenre} movies error:`, data.Error)
        }
      } catch (error) {
        console.error(`Error fetching ${selectedGenre} movies:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGenreMovies()
  }, [selectedGenre, genreMovies])

  // Fetch decade movies when selected decade changes
  useEffect(() => {
    const fetchDecadeMovies = async () => {
      if (!selectedDecade) return

      if (decadeMovies[selectedDecade]) {
        // Already fetched this decade
        return
      }

      const decade = decades.find((d) => d.name === selectedDecade)
      if (!decade) return

      setIsLoading(true)
      try {
        // Use the middle year of the decade as a representative
        const yearToSearch = Math.floor((decade.start + decade.end) / 2)
        const response = await fetch(`/api/movies?search=${yearToSearch}&year=${yearToSearch}`)
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        const data: MovieSearchResponse = await response.json()

        if (data.Response === "True" && data.Search) {
          setDecadeMovies((prev) => ({
            ...prev,
            [selectedDecade]: data.Search.slice(0, 10),
          }))
        } else if (data.Error) {
          console.error(`${selectedDecade} movies error:`, data.Error)
        }
      } catch (error) {
        console.error(`Error fetching ${selectedDecade} movies:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDecadeMovies()
  }, [selectedDecade, decadeMovies])

  const handleMovieClick = (imdbID: string) => {
    router.push(`/movie/${imdbID}`)
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

        {/* Hero section */}
        <div className="mb-10">
          <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700/50">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 mix-blend-overlay"></div>
            <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">Explore Movies</h1>
              <p className="text-slate-300 max-w-lg mb-4">
                Discover movies by genre, decade, or browse trending and top-rated films.
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-cyan-500/30 blur-3xl"></div>
            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-blue-500/30 blur-3xl"></div>
          </div>
        </div>

        {/* Main content */}
        <div className="mb-10">
          <Tabs defaultValue="trending" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 p-1 mb-6">
              <TabsTrigger
                value="trending"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger
                value="top-rated"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
              >
                <Star className="mr-2 h-4 w-4" />
                Top Rated
              </TabsTrigger>
              <TabsTrigger
                value="genres"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
              >
                <Film className="mr-2 h-4 w-4" />
                Genres
              </TabsTrigger>
              <TabsTrigger
                value="decades"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Decades
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {trendingMovies.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} onClick={() => handleMovieClick(movie.imdbID)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="top-rated" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {topRatedMovies.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} onClick={() => handleMovieClick(movie.imdbID)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="genres" className="mt-0">
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Button
                      key={genre.query}
                      variant={selectedGenre === genre.query ? "default" : "outline"}
                      className={
                        selectedGenre === genre.query
                          ? "bg-cyan-600 hover:bg-cyan-700"
                          : "border-slate-700 text-slate-300 hover:bg-slate-800"
                      }
                      onClick={() => setSelectedGenre(genre.query)}
                    >
                      {genre.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {genreMovies[selectedGenre]?.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} onClick={() => handleMovieClick(movie.imdbID)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="decades" className="mt-0">
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {decades.map((decade) => (
                    <Button
                      key={decade.name}
                      variant={selectedDecade === decade.name ? "default" : "outline"}
                      className={
                        selectedDecade === decade.name
                          ? "bg-cyan-600 hover:bg-cyan-700"
                          : "border-slate-700 text-slate-300 hover:bg-slate-800"
                      }
                      onClick={() => setSelectedDecade(decade.name)}
                    >
                      {decade.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {decadeMovies[selectedDecade]?.map((movie) => (
                  <MovieCard key={movie.imdbID} movie={movie} onClick={() => handleMovieClick(movie.imdbID)} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
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
