"use client"

import { Star, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Movie {
  imdbID: string
  Title: string
  Year: string
  Poster: string
  Type: string
  imdbRating?: string
}

interface MovieCardProps {
  movie: Movie
  onClick: () => void
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <Card
      className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-pointer overflow-hidden group"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] bg-slate-900 overflow-hidden">
        {movie.Poster && movie.Poster !== "N/A" ? (
          <img
            src={movie.Poster || "/placeholder.svg"}
            alt={movie.Title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-slate-600 text-lg">No Poster</span>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

        {/* Year badge */}
        <Badge className="absolute top-2 right-2 bg-slate-800/80 text-slate-300 border-slate-700/50">
          <Calendar className="mr-1 h-3 w-3" /> {movie.Year}
        </Badge>

        {/* Rating badge (if available) */}
        {movie.imdbRating && (
          <Badge className="absolute top-2 left-2 bg-amber-500/20 text-amber-400 border-amber-500/30">
            <Star className="mr-1 h-3 w-3 fill-amber-500 text-amber-500" /> {movie.imdbRating}
          </Badge>
        )}
      </div>

      <CardContent className="p-3">
        <h3 className="font-medium text-slate-200 line-clamp-1 group-hover:text-cyan-400 transition-colors">
          {movie.Title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-400">{movie.Year}</span>
          <span className="text-xs text-slate-500 capitalize">{movie.Type}</span>
        </div>
      </CardContent>
    </Card>
  )
}
