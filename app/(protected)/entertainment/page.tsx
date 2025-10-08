"use client"

import { useState, useEffect } from "react"
import { Film, Plus, Star, Tv, BookOpen, Gamepad2, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { AddEntertainmentDialog } from "@/components/dialogs/add-entertainment-dialog"
import { EditEntertainmentDialog } from "@/components/dialogs/edit-entertainment-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function EntertainmentPage() {
  const [entertainmentDialogOpen, setEntertainmentDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [itemToEdit, setItemToEdit] = useState<any>(null)

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/entertainment")
      const data = await res.json()
      if (res.ok && data.success) {
        setItems(data.data)
      } else {
        setError(data.error || "Failed to fetch items")
      }
    } catch (err) {
      setError("Failed to fetch items")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    try {
      await fetch(`/api/entertainment/${id}`, { method: "DELETE" })
      setItems(items => items.filter(i => i.id !== id))
    } catch (err) {
      alert("Failed to delete item")
    }
  }

  const openEdit = (item: any) => {
    setItemToEdit(item)
    setEditDialogOpen(true)
  }

  const typeTabs = [
    { value: "movies", label: "Movies", icon: Film, type: "MOVIE" },
    { value: "tv", label: "TV Shows", icon: Tv, type: "TV_SHOW" },
    { value: "games", label: "Games", icon: Gamepad2, type: "GAME" },
  ]

  // Helper filters for each tab/section
  const recentlyWatchedMovies = items.filter(i => i.type === "MOVIE" && i.status === "COMPLETED");
  const watchlistMovies = items.filter(i => i.type === "MOVIE" && i.status === "WANT_TO_WATCH");

  const currentlyWatchingTV = items.filter(i => i.type === "TV_SHOW" && i.status === "WATCHING");
  const tvShowWatchlist = items.filter(i => i.type === "TV_SHOW" && i.status === "WANT_TO_WATCH");

  const currentlyPlayingGames = items.filter(i => i.type === "GAME" && i.status === "PLAYING");
  const gameBacklog = items.filter(i => i.type === "GAME" && i.status === "WANT_TO_PLAY");

  const completedTVShows = items.filter(i => i.type === "TV_SHOW" && i.status === "COMPLETED");

  // Helper to format 'x days ago' from a date string
  function getDaysAgo(dateString: string | null) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return "Today";
    if (diff === 1) return "1 day ago";
    return `${diff} days ago`;
  }

  // Mark as watched handler
  const markWatched = async (item: any) => {
    await fetch(`/api/entertainment/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status: "COMPLETED" })
    });
    fetchItems();
  };

  // Mark as playing handler for games
  const markPlaying = async (item: any) => {
    await fetch(`/api/entertainment/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status: "PLAYING" })
    });
    fetchItems();
  };

  // Mark as watching handler for TV shows
  const markWatching = async (item: any) => {
    await fetch(`/api/entertainment/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status: "WATCHING" })
    });
    fetchItems();
  };

  // Mark as completed handler for TV shows
  const markCompleted = async (item: any) => {
    await fetch(`/api/entertainment/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, status: "COMPLETED" })
    });
    fetchItems();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entertainment Tracker</h1>
          <p className="text-muted-foreground">Track movies, TV shows, and games</p>
        </div>
      </div>

      <Tabs defaultValue="movies">
        <TabsList className="grid w-full grid-cols-3">
          {typeTabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
          ))}
        </TabsList>
        {/* Movies Tab */}
        <TabsContent value="movies" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recently Watched */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Film className="mr-2 h-5 w-5" />
                  Recently Watched
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {recentlyWatchedMovies.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No recently watched movies.</div>
                    ) : (
                      recentlyWatchedMovies.map(item => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                        <div className="space-y-1">
                            <h4 className="font-medium">{item.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {item.year && <span>{item.year}</span>}
                              {item.year && item.genre && <span>•</span>}
                              {item.genre && <Badge variant="outline">{item.genre}</Badge>}
                            </div>
                            {item.createdAt && <p className="text-xs text-muted-foreground">{getDaysAgo(item.createdAt)}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 mr-2">
                          {Array.from({ length: 5 }).map((_, j) => (
                                <Star key={j} className={`h-4 w-4 ${j < item.rating ? "text-yellow-500" : "text-gray-300"}`} fill={j < item.rating ? "#facc15" : "none"} />
                              ))}
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(item)}>Edit</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            {/* Watchlist */}
            <Card>
              <CardHeader>
                <CardTitle>Watchlist</CardTitle>
                <CardDescription>Movies you want to watch</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {watchlistMovies.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No movies in watchlist.</div>
                    ) : (
                      watchlistMovies.map(item => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                        <div className="space-y-1">
                            <h4 className="font-medium">{item.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {item.year && <span>{item.year}</span>}
                              {item.year && item.genre && <span>•</span>}
                              {item.genre && <Badge variant="outline">{item.genre}</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => markWatched(item)}>Mark Watched</Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(item)}>Edit</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TV Shows Tab */}
        <TabsContent value="tv" className="mt-4 space-y-4">
          <div className="text-xs text-muted-foreground mb-2">Currently Watching: {currentlyWatchingTV.length}, Watchlist: {tvShowWatchlist.length}</div>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Currently Watching */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Tv className="mr-2 h-5 w-5" />
                  Currently Watching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                    {currentlyWatchingTV.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No TV shows currently being watched.</div>
                    ) : (
                      currentlyWatchingTV.map(item => {
                        const progress = (item.currentEpisode && item.totalEpisodes && item.totalEpisodes > 0)
                          ? Math.round((item.currentEpisode / item.totalEpisodes) * 100)
                          : null;
                        return (
                          <div key={item.id} className="border-b pb-3 last:border-0">
                            <div className="flex justify-between items-center">
                              <div className="space-y-1 min-w-0">
                                <h4 className="font-medium">{item.title}</h4>
                                {(item.currentSeason && item.currentEpisode && item.totalEpisodes) && (
                                  <div className="text-[14px] text-muted-foreground">
                                    S{item.currentSeason}:E{item.currentEpisode} of {item.totalEpisodes}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="secondary" onClick={() => markCompleted(item)}>Mark Completed</Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => openEdit(item)}>Edit</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            {progress !== null && (
                              <div className="mt-2 w-full">
                                <Progress value={progress} className="h-2 w-full" />
                                <div className="text-xs text-muted-foreground mt-1">{progress}%</div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                </div>
                </ScrollArea>
              </CardContent>
            </Card>
            {/* TV Show Watchlist */}
            <Card>
              <CardHeader>
                <CardTitle>TV Show Watchlist</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {tvShowWatchlist.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No TV shows in watchlist.</div>
                    ) : (
                      tvShowWatchlist.map(item => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                        <div className="space-y-1">
                            <h4 className="font-medium">{item.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{item.totalEpisodes} Episodes</span>
                               <span>•</span>
                              {item.genre && <Badge variant="outline">{item.genre}</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => markWatching(item)}>Mark Watching</Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(item)}>Edit</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-lg">📺</span>
                Completed TV Shows
              </CardTitle>
              <CardDescription>Shows you've finished watching</CardDescription>
            </CardHeader>
            <CardContent>
              {completedTVShows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No completed TV shows.</div>
              ) : (
                completedTVShows.map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b border-border pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-base">{item.title}</span>
                        {item.genre && <Badge variant="outline" className="text-xs px-2 py-0.5">{item.genre}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-1">
                        {item.seasons && <span>{item.seasons} seasons</span>}
                        {item.episodes && <span>{item.episodes} episodes</span>}
                        {item.hours && <span>{item.hours}h total</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Completed {getDaysAgo(item.completedAt || item.updatedAt || item.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`h-4 w-4 ${j < item.rating ? "text-yellow-500" : "text-gray-300"}`} fill={j < item.rating ? "#facc15" : "none"} />
                        ))}
                      </span>
                      <Button size="sm" variant="secondary" onClick={() => markWatched({ ...item, status: "WATCHING" })}>Rewatch</Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(item)}>Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Games Tab */}
        <TabsContent value="games" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Currently Playing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Currently Playing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                    {currentlyPlayingGames.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No games currently being played.</div>
                    ) : (
                      currentlyPlayingGames.map(item => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                          <div className="space-y-1">
                            <h4 className="font-medium">{item.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {item.genre && <Badge variant="outline">{item.genre}</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(item)}>Edit</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    )}
                      </div>
                </ScrollArea>
              </CardContent>
            </Card>
            {/* Game Backlog */}
            <Card>
              <CardHeader>
                <CardTitle>Game Backlog</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4">
                    {gameBacklog.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No games in backlog.</div>
                    ) : (
                      gameBacklog.map(item => (
                        <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                        <div className="space-y-1">
                            <h4 className="font-medium">{item.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {item.genre && <Badge variant="outline">{item.genre}</Badge>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => markPlaying(item)}>Mark Playing</Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openEdit(item)}>Edit</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(item.id)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      <AddEntertainmentDialog
        open={entertainmentDialogOpen}
        onOpenChange={setEntertainmentDialogOpen}
        onCreated={fetchItems}
      />
      {itemToEdit && (
        <EditEntertainmentDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          item={itemToEdit}
          onUpdated={updated => {
            setItems(items => items.map(i => i.id === updated.id ? updated : i))
            setEditDialogOpen(false)
            setItemToEdit(null)
          }}
        />
      )}
    </div>
  )
}
