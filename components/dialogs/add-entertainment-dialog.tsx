"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AddEntertainmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

const typeMap: Record<string, string> = {
  movie: "MOVIE",
  tv: "TV_SHOW",
  game: "GAME",
};
const statusMap: Record<string, string> = {
  "want-to-watch": "WANT_TO_WATCH",
  "want-to-play": "WANT_TO_PLAY",
  watching: "WATCHING",
  playing: "PLAYING",
  completed: "COMPLETED",
  "on-hold": "ON_HOLD",
  dropped: "DROPPED",
};

export function AddEntertainmentDialog({ open, onOpenChange, onCreated }: AddEntertainmentDialogProps) {
  const [type, setType] = useState("movie")
  const [title, setTitle] = useState("")
  const [year, setYear] = useState("")
  const [genre, setGenre] = useState("")
  const [platform, setPlatform] = useState("")
  const [status, setStatus] = useState("")
  const [rating, setRating] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSeason, setCurrentSeason] = useState("");
  const [currentEpisode, setCurrentEpisode] = useState("");
  const [totalEpisodes, setTotalEpisodes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/entertainment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type: typeMap[type],
          status: statusMap[status] || "WANT_TO_WATCH",
          rating: rating ? parseInt(rating) : null,
          genre: genre || null,
          year: year ? parseInt(year) : null,
          notes: notes || null,
          currentSeason: type === "tv" && currentSeason ? parseInt(currentSeason) : null,
          currentEpisode: type === "tv" && currentEpisode ? parseInt(currentEpisode) : null,
          totalEpisodes: type === "tv" && totalEpisodes ? parseInt(totalEpisodes) : null,
        }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setTitle("")
        setYear("")
        setGenre("")
        setPlatform("")
        setStatus("")
        setRating("")
        setNotes("")
        setCurrentSeason("");
        setCurrentEpisode("");
        setTotalEpisodes("");
        onOpenChange(false)
        onCreated?.()
      } else {
        setError(result.error || "Failed to add entertainment item")
      }
    } catch (err) {
      setError("Failed to add entertainment item")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Entertainment</DialogTitle>
          <DialogDescription>Add a movie, TV show, or game to track.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Tabs value={type} onValueChange={setType}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="movie">Movie</TabsTrigger>
                <TabsTrigger value="tv">TV Show</TabsTrigger>
                <TabsTrigger value="game">Game</TabsTrigger>
              </TabsList>

              <TabsContent value="movie" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="movie-title">Movie Title *</Label>
                  <Input
                    id="movie-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Inception"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="movie-year">Year</Label>
                    <Input id="movie-year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2024" />
                  </div>

                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="action">Action</SelectItem>
                        <SelectItem value="comedy">Comedy</SelectItem>
                        <SelectItem value="drama">Drama</SelectItem>
                        <SelectItem value="horror">Horror</SelectItem>
                        <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                        <SelectItem value="thriller">Thriller</SelectItem>
                        <SelectItem value="romance">Romance</SelectItem>
                        <SelectItem value="animation">Animation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tv" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="tv-title">TV Show Title *</Label>
                  <Input
                    id="tv-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Breaking Bad"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tv-year">Year</Label>
                    <Input id="tv-year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2008" />
                  </div>

                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drama">Drama</SelectItem>
                        <SelectItem value="comedy">Comedy</SelectItem>
                        <SelectItem value="action">Action</SelectItem>
                        <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                        <SelectItem value="crime">Crime</SelectItem>
                        <SelectItem value="documentary">Documentary</SelectItem>
                        <SelectItem value="reality">Reality</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tv-season">Current Season</Label>
                    <Input id="tv-season" value={currentSeason} onChange={e => setCurrentSeason(e.target.value)} placeholder="e.g., 3" type="number" min="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tv-episode">Current Episode</Label>
                    <Input id="tv-episode" value={currentEpisode} onChange={e => setCurrentEpisode(e.target.value)} placeholder="e.g., 5" type="number" min="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tv-total-episodes">Total Episodes</Label>
                    <Input id="tv-total-episodes" value={totalEpisodes} onChange={e => setTotalEpisodes(e.target.value)} placeholder="e.g., 10" type="number" min="1" />
                  </div>
                </div>
              </TabsContent>



              <TabsContent value="game" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="game-title">Game Title *</Label>
                  <Input
                    id="game-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Baldur's Gate 3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={platform} onValueChange={setPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pc">PC</SelectItem>
                        <SelectItem value="ps5">PlayStation 5</SelectItem>
                        <SelectItem value="xbox">Xbox Series X/S</SelectItem>
                        <SelectItem value="switch">Nintendo Switch</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Genre</Label>
                    <Select value={genre} onValueChange={setGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rpg">RPG</SelectItem>
                        <SelectItem value="action">Action</SelectItem>
                        <SelectItem value="adventure">Adventure</SelectItem>
                        <SelectItem value="strategy">Strategy</SelectItem>
                        <SelectItem value="simulation">Simulation</SelectItem>
                        <SelectItem value="puzzle">Puzzle</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {type === "game" ? (
                      <>
                        <SelectItem value="want-to-play">Want to Play</SelectItem>
                        <SelectItem value="playing">Currently Playing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="want-to-watch">Want to Watch</SelectItem>
                        <SelectItem value="watching">Currently Watching</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="dropped">Dropped</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={rating} onValueChange={setRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rate it" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5/5)</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ (4/5)</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ (3/5)</SelectItem>
                    <SelectItem value="2">⭐⭐ (2/5)</SelectItem>
                    <SelectItem value="1">⭐ (1/5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entertainment-notes">Notes</Label>
              <Textarea
                id="entertainment-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Your thoughts, review, or notes..."
                rows={3}
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Adding..." : "Add to Library"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
