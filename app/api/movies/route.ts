import { NextResponse } from "next/server"

const API_KEY = "2e9e3279" // Your provided OMDb API key

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get("title")
  const imdbId = searchParams.get("imdbId")
  const search = searchParams.get("search")
  const year = searchParams.get("year")
  const genre = searchParams.get("genre")
  const page = searchParams.get("page") || "1"

  const url = "http://www.omdbapi.com/"
  const params = new URLSearchParams()
  params.append("apikey", API_KEY)

  if (imdbId) {
    // Fetch by IMDb ID
    params.append("i", imdbId)
  } else if (title) {
    // Fetch by exact title
    params.append("t", title)
  } else if (search) {
    // Search for movies
    params.append("s", search)
    params.append("page", page)

    if (year) {
      params.append("y", year)
    }

    if (genre) {
      params.append("type", "movie")
    }
  } else {
    // Default to some popular movies if no parameters
    params.append("s", "marvel")
    params.append("page", page)
  }

  try {
    const apiUrl = `${url}?${params.toString()}`
    console.log("Fetching from URL:", apiUrl)

    const response = await fetch(apiUrl)

    if (!response.ok) {
      console.error("API response not OK:", response.status, response.statusText)
      const text = await response.text()
      console.error("Response text:", text)
      return NextResponse.json(
        {
          Response: "False",
          Error: `API error: ${response.status} ${response.statusText}`,
        },
        { status: response.status },
      )
    }

    const text = await response.text()

    try {
      // Try to parse the response as JSON
      const data = JSON.parse(text)
      return NextResponse.json(data)
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError)
      console.error("Raw response:", text)
      return NextResponse.json(
        {
          Response: "False",
          Error: "Invalid JSON response from API",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error fetching movie data:", error)
    return NextResponse.json(
      {
        Response: "False",
        Error: "Failed to fetch movie data",
      },
      { status: 500 },
    )
  }
}
