"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  Film,
  User,
  Award,
  Hexagon,
  Tag,
  ExternalLink,
  Heart,
  Share2,
  Bookmark,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import MovieCard from "@/components/movie-card"

// Types
interface MovieDetail {
  Title: string
  Year: string
  Rated: string
  Released: string
  Runtime: string
  Genre: string
  Director: string
  Writer: string
  Actors: string
  Plot: string
  Language: string
  Country: string
  Awards: string
  Poster: string
  Ratings: { Source: string; Value: string }[]
  Metascore: string
  imdbRating: string
  imdbVotes: string
  imdbID: string
  Type: string
  DVD: string
  BoxOffice: string
  Production: string
  Website: string
  Response: string
}

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

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
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

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return

      setIsLoading(true)
      try {
        const response = await fetch(`/api/movies?imdbId=${id}`)
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }
        const data = await response.json()

        if (data.Response === "True") {
          setMovie(data)

          // Fetch similar movies based on genre
          if (data.Genre) {
            const firstGenre = data.Genre.split(",")[0].trim()
            const similarResponse = await fetch(`/api/movies?search=${firstGenre}`)
            if (!similarResponse.ok) {
              throw new Error(`API error: ${similarResponse.status}`)
            }
            const similarData: MovieSearchResponse = await similarResponse.json()

            if (similarData.Response === "True" && similarData.Search) {
              // Filter out the current movie and limit to 6
              const filtered = similarData.Search.filter((m) => m.imdbID !== id).slice(0, 6)
              setSimilarMovies(filtered)
            } else if (similarData.Error) {
              console.error("Similar movies error:", similarData.Error)
            }
          }
        } else if (data.Error) {
          console.error("Movie details error:", data.Error)
        }
      } catch (error) {
        console.error("Error fetching movie details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMovieDetails()
  }, [id])

  const handleSimilarMovieClick = (imdbID: string) => {
    router.push(`/movie/${imdbID}`)
  }

  // Format IMDb rating to percentage
  const getRatingPercentage = (rating: string) => {
    const num = Number.parseFloat(rating)
    return isNaN(num) ? 0 : num * 10
  }

  // Extract year from release date
  const getYearFromReleaseDate = (releaseDate: string) => {
    const match = releaseDate.match(/\d{4}/)
    return match ? match[0] : ""
  }

  // Parse runtime to minutes
  const parseRuntime = (runtime: string) => {
    const match = runtime.match(/(\d+)/)
    return match ? Number.parseInt(match[1]) : 0
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
            <div className="mt-4 text-cyan-500 font-mono text-sm tracking-wider">LOADING MOVIE</div>
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
              onClick={() => router.back()}
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

        {movie && (
          <>
            {/* Movie hero section */}
            <div className="mb-8">
              <div className="relative rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent z-10"></div>

                {/* Movie backdrop - using poster as fallback */}
                <div className="w-full h-64 md:h-96 bg-slate-800 relative">
                  {movie.Poster && movie.Poster !== "N/A" ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-sm opacity-50"
                      style={{ backgroundImage: `url(${movie.Poster})` }}
                    ></div>
                  ) : null}

                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-800/50"></div>

                  <div className="relative z-20 h-full flex flex-col md:flex-row items-end md:items-center p-6 md:p-10">
                    {/* Movie poster */}
                    <div className="w-32 md:w-48 h-48 md:h-72 bg-slate-700 rounded-lg overflow-hidden shadow-lg flex-shrink-0 border border-slate-600/50">
                      {movie.Poster && movie.Poster !== "N/A" ? (
                        <img
                          src={movie.Poster || "/placeholder.svg"}
                          alt={movie.Title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="h-12 w-12 text-slate-500" />
                        </div>
                      )}
                    </div>

                    {/* Movie info */}
                    <div className="md:ml-8 mt-4 md:mt-0 flex-1">
                      <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{movie.Title}</h1>

                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {movie.Year && (
                          <Badge variant="outline" className="bg-slate-800/70 border-slate-700 text-slate-300">
                            <Calendar className="mr-1 h-3 w-3" /> {movie.Year}
                          </Badge>
                        )}

                        {movie.Runtime && movie.Runtime !== "N/A" && (
                          <Badge variant="outline" className="bg-slate-800/70 border-slate-700 text-slate-300">
                            <Clock className="mr-1 h-3 w-3" /> {movie.Runtime}
                          </Badge>
                        )}

                        {movie.Rated && movie.Rated !== "N/A" && (
                          <Badge variant="outline" className="bg-slate-800/70 border-slate-700 text-slate-300">
                            {movie.Rated}
                          </Badge>
                        )}

                        {movie.imdbRating && movie.imdbRating !== "N/A" && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <Star className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" /> {movie.imdbRating}/10
                          </Badge>
                        )}
                      </div>

                      <p className="text-slate-300 mb-6 max-w-2xl line-clamp-3 md:line-clamp-none">{movie.Plot}</p>

                      <div className="flex flex-wrap gap-2">
                        <Button className="bg-cyan-600 hover:bg-cyan-700">
                          <Play className="mr-2 h-4 w-4" /> Watch Trailer
                        </Button>
                        <Button variant="outline" className="border-slate-600 bg-slate-800/50 hover:bg-slate-700/50">
                          <Heart className="mr-2 h-4 w-4" /> Add to Favorites
                        </Button>
                        <Button variant="outline" className="border-slate-600 bg-slate-800/50 hover:bg-slate-700/50">
                          <Share2 className="mr-2 h-4 w-4" /> Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Movie details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
              {/* Main details */}
              <div className="lg:col-span-2">
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-slate-100 flex items-center">
                      <Film className="mr-2 h-5 w-5 text-cyan-500" />
                      Movie Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="bg-slate-800/50 p-1 mb-4">
                        <TabsTrigger
                          value="overview"
                          className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                        >
                          Overview
                        </TabsTrigger>
                        <TabsTrigger
                          value="cast"
                          className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                        >
                          Cast & Crew
                        </TabsTrigger>
                        <TabsTrigger
                          value="ratings"
                          className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                        >
                          Ratings
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="mt-0">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-medium text-slate-200 mb-2">Synopsis</h3>
                            <p className="text-slate-300">{movie.Plot}</p>
                          </div>

                          <Separator className="bg-slate-700/50" />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-slate-400 mb-2">Genre</h3>
                              <div className="flex flex-wrap gap-2">
                                {movie.Genre &&
                                  movie.Genre.split(",").map((genre, index) => (
                                    <Badge key={index} className="bg-slate-800 hover:bg-slate-700 text-slate-300">
                                      {genre.trim()}
                                    </Badge>
                                  ))}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-medium text-slate-400 mb-2">Release Information</h3>
                              <div className="text-slate-300">
                                <p>Released: {movie.Released}</p>
                                {movie.DVD && movie.DVD !== "N/A" && <p>DVD: {movie.DVD}</p>}
                                {movie.BoxOffice && movie.BoxOffice !== "N/A" && <p>Box Office: {movie.BoxOffice}</p>}
                              </div>
                            </div>
                          </div>

                          <Separator className="bg-slate-700/50" />

                          <div>
                            <h3 className="text-sm font-medium text-slate-400 mb-2">Additional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-slate-300">
                                  <span className="text-slate-500">Language:</span> {movie.Language}
                                </p>
                                <p className="text-slate-300">
                                  <span className="text-slate-500">Country:</span> {movie.Country}
                                </p>
                                {movie.Website && movie.Website !== "N/A" && (
                                  <p className="text-slate-300">
                                    <span className="text-slate-500">Website:</span>{" "}
                                    <a
                                      href={movie.Website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-cyan-400 hover:text-cyan-300 inline-flex items-center"
                                    >
                                      Visit <ExternalLink className="ml-1 h-3 w-3" />
                                    </a>
                                  </p>
                                )}
                              </div>
                              <div>
                                {movie.Awards && movie.Awards !== "N/A" && (
                                  <p className="text-slate-300">
                                    <span className="text-slate-500">Awards:</span> {movie.Awards}
                                  </p>
                                )}
                                {movie.Production && movie.Production !== "N/A" && (
                                  <p className="text-slate-300">
                                    <span className="text-slate-500">Production:</span> {movie.Production}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="cast" className="mt-0">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium text-slate-200 mb-3">Cast</h3>
                            <div className="space-y-3">
                              {movie.Actors &&
                                movie.Actors.split(",").map((actor, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-3 p-2 bg-slate-800/50 rounded-lg"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                      <User className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                      <p className="text-slate-200">{actor.trim()}</p>
                                      <p className="text-xs text-slate-500">Actor</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <Separator className="bg-slate-700/50" />

                          <div>
                            <h3 className="text-lg font-medium text-slate-200 mb-3">Director</h3>
                            <div className="space-y-3">
                              {movie.Director &&
                                movie.Director.split(",").map((director, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-3 p-2 bg-slate-800/50 rounded-lg"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                      <User className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                      <p className="text-slate-200">{director.trim()}</p>
                                      <p className="text-xs text-slate-500">Director</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <Separator className="bg-slate-700/50" />

                          <div>
                            <h3 className="text-lg font-medium text-slate-200 mb-3">Writers</h3>
                            <div className="space-y-3">
                              {movie.Writer &&
                                movie.Writer.split(",").map((writer, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-3 p-2 bg-slate-800/50 rounded-lg"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                      <User className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <div>
                                      <p className="text-slate-200">{writer.trim()}</p>
                                      <p className="text-xs text-slate-500">Writer</p>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="ratings" className="mt-0">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-medium text-slate-200 mb-3">Ratings</h3>
                            <div className="space-y-4">
                              {/* IMDb Rating */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center">
                                    <Star className="h-4 w-4 text-amber-500 mr-2" />
                                    <span className="text-slate-300">IMDb Rating</span>
                                  </div>
                                  <span className="text-amber-400 font-medium">{movie.imdbRating}/10</span>
                                </div>
                                <Progress value={getRatingPercentage(movie.imdbRating)} className="h-2 bg-slate-700">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                                    style={{ width: `${getRatingPercentage(movie.imdbRating)}%` }}
                                  />
                                </Progress>
                                <div className="mt-1 text-xs text-slate-500 text-right">{movie.imdbVotes} votes</div>
                              </div>

                              {/* Metascore */}
                              {movie.Metascore && movie.Metascore !== "N/A" && (
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                      <Award className="h-4 w-4 text-green-500 mr-2" />
                                      <span className="text-slate-300">Metascore</span>
                                    </div>
                                    <span className="text-green-400 font-medium">{movie.Metascore}/100</span>
                                  </div>
                                  <Progress value={Number.parseInt(movie.Metascore)} className="h-2 bg-slate-700">
                                    <div
                                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                                      style={{ width: `${movie.Metascore}%` }}
                                    />
                                  </Progress>
                                </div>
                              )}

                              {/* Other Ratings */}
                              {movie.Ratings &&
                                movie.Ratings.map((rating, index) => {
                                  if (rating.Source === "Internet Movie Database") return null
                                  if (rating.Source === "Metacritic") return null

                                  let value = 0
                                  let color = "blue"

                                  if (rating.Source === "Rotten Tomatoes") {
                                    value = Number.parseInt(rating.Value)
                                    color = value >= 60 ? "green" : "red"
                                  }

                                  return (
                                    <div key={index}>
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center">
                                          <Award className={`h-4 w-4 text-${color}-500 mr-2`} />
                                          <span className="text-slate-300">{rating.Source}</span>
                                        </div>
                                        <span className={`text-${color}-400 font-medium`}>{rating.Value}</span>
                                      </div>
                                      {value > 0 && (
                                        <Progress value={value} className="h-2 bg-slate-700">
                                          <div
                                            className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full`}
                                            style={{ width: `${value}%` }}
                                          />
                                        </Progress>
                                      )}
                                    </div>
                                  )
                                })}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div>
                <div className="space-y-6">
                  {/* Movie stats */}
                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-slate-100 text-base flex items-center">
                        <Star className="mr-2 h-5 w-5 text-cyan-500" />
                        Movie Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-400">IMDb Rating</div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-amber-500 mr-1" />
                            <span className="text-amber-400 font-medium">{movie.imdbRating}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-400">Release Year</div>
                          <div className="text-slate-300">{movie.Year}</div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-400">Runtime</div>
                          <div className="text-slate-300">{movie.Runtime}</div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-400">Language</div>
                          <div className="text-slate-300">{movie.Language}</div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-400">Country</div>
                          <div className="text-slate-300">{movie.Country}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-slate-100 text-base flex items-center">
                        <Tag className="mr-2 h-5 w-5 text-cyan-500" />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {movie.Genre &&
                          movie.Genre.split(",").map((genre, index) => (
                            <Badge key={index} className="bg-slate-800 hover:bg-slate-700 text-slate-300">
                              {genre.trim()}
                            </Badge>
                          ))}

                        <Badge className="bg-slate-800 hover:bg-slate-700 text-slate-300">{movie.Year}</Badge>

                        {movie.Language &&
                          movie.Language.split(",").map((language, index) => (
                            <Badge key={index} className="bg-slate-800 hover:bg-slate-700 text-slate-300">
                              {language.trim()}
                            </Badge>
                          ))}

                        {movie.Rated && movie.Rated !== "N/A" && (
                          <Badge className="bg-slate-800 hover:bg-slate-700 text-slate-300">{movie.Rated}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick actions */}
                  <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-slate-100 text-base">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                        >
                          <Heart className="mr-2 h-4 w-4 text-red-500" />
                          Add to Favorites
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                        >
                          <Bookmark className="mr-2 h-4 w-4 text-cyan-500" />
                          Add to Watchlist
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                        >
                          <Share2 className="mr-2 h-4 w-4 text-purple-500" />
                          Share Movie
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-slate-700 bg-slate-800/50 hover:bg-slate-700/50"
                        >
                          <ExternalLink className="mr-2 h-4 w-4 text-blue-500" />
                          View on IMDb
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Similar movies */}
            {similarMovies.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Film className="mr-2 h-5 w-5 text-cyan-500" />
                  Similar Movies
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {similarMovies.map((movie) => (
                    <MovieCard key={movie.imdbID} movie={movie} onClick={() => handleSimilarMovieClick(movie.imdbID)} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

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
