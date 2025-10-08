"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const typeMap: Record<string, string> = {
  MOVIE: "movie",
  TV_SHOW: "tv",
  GAME: "game",
};
const typeMapReverse: Record<string, string> = {
  movie: "MOVIE",
  tv: "TV_SHOW",
  game: "GAME",
};
const statusMap: Record<string, string> = {
  WANT_TO_WATCH: "want-to-watch",
  WANT_TO_PLAY: "want-to-play",
  WATCHING: "watching",
  PLAYING: "playing",
  COMPLETED: "completed",
  ON_HOLD: "on-hold",
  DROPPED: "dropped",
};
const statusMapReverse: Record<string, string> = {
  "want-to-watch": "WANT_TO_WATCH",
  "want-to-play": "WANT_TO_PLAY",
  watching: "WATCHING",
  playing: "PLAYING",
  completed: "COMPLETED",
  "on-hold": "ON_HOLD",
  dropped: "DROPPED",
};

interface EntertainmentItem {
  currentEpisode: null;
  totalEpisodes: null;
  item: null;
  currentSeason: null;
  id: string;
  title: string;
  type: string;
  status: string;
  rating?: number | null;
  genre?: string | null;
  notes?: string | null;
}

interface EditEntertainmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: EntertainmentItem | null;
  onUpdated?: (item: EntertainmentItem) => void;
}

export function EditEntertainmentDialog({ open, onOpenChange, item, onUpdated }: EditEntertainmentDialogProps) {
  const [currentSeason, setCurrentSeason] = useState("");
  const [currentEpisode, setCurrentEpisode] = useState("");
  const [totalEpisodes, setTotalEpisodes] = useState("");
  const [type, setType] = useState("movie");
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [status, setStatus] = useState("");
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setType(typeMap[item.type] || "movie");
      setTitle(item.title || "");
      setGenre(item.genre || "");
      setStatus(statusMap[item.status] || "want-to-watch");
      setRating(item.rating ? String(item.rating) : "");
      setNotes(item.notes || "");
      setCurrentSeason(item.currentSeason !== undefined && item.currentSeason !== null ? String(item.currentSeason) : "");
      setCurrentEpisode(item.currentEpisode !== undefined && item.currentEpisode !== null ? String(item.currentEpisode) : "");
      setTotalEpisodes(item.totalEpisodes !== undefined && item.totalEpisodes !== null ? String(item.totalEpisodes) : "");
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/entertainment/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type: typeMapReverse[type],
          status: statusMapReverse[status] || "WANT_TO_WATCH",
          rating: rating ? parseInt(rating) : null,
          genre: genre || null,
          currentSeason: currentSeason ? parseInt(currentSeason) : null,
          currentEpisode: currentEpisode ? parseInt(currentEpisode) : null,
          totalEpisodes: totalEpisodes ? parseInt(totalEpisodes) : null,
          notes: notes || null,
        }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        onUpdated?.(result.data);
        onOpenChange(false);
      } else {
        setError(result.error || "Failed to update entertainment item");
      }
    } catch (err) {
      setError("Failed to update entertainment item");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Entertainment</DialogTitle>
          <DialogDescription>Edit your movie, TV show, book, or game details.</DialogDescription>
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
                {/* Movie fields here (if any) */}
              </TabsContent>
              <TabsContent value="tv" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-tv-season">Current Season</Label>
                    <Input id="edit-tv-season" value={currentSeason} onChange={e => setCurrentSeason(e.target.value)} placeholder="e.g., 3" type="number" min="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tv-episode">Current Episode</Label>
                    <Input id="edit-tv-episode" value={currentEpisode} onChange={e => setCurrentEpisode(e.target.value)} placeholder="e.g., 5" type="number" min="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tv-total-episodes">Total Episodes</Label>
                    <Input id="edit-tv-total-episodes" value={totalEpisodes} onChange={e => setTotalEpisodes(e.target.value)} placeholder="e.g., 10" type="number" min="1" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="game" className="space-y-4 mt-4">
                {/* Game fields here (if any) */}
              </TabsContent>
            </Tabs>
            <div className="space-y-2">
              <Label htmlFor="ent-title">Title *</Label>
              <Input
                id="ent-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Genre</Label>
              <Input value={genre} onChange={(e) => setGenre(e.target.value)} placeholder="Genre" />
            </div>
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
              <Label htmlFor="ent-notes">Notes</Label>
              <Textarea
                id="ent-notes"
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
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 