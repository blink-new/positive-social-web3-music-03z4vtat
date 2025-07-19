import { useState, useEffect } from 'react'
import { Heart, Flame, Sparkles, ThumbsDown, Music, Plus, TrendingUp, Wallet, Upload, Play, Pause } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader } from './components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar'
import { Badge } from './components/ui/badge'
import { Progress } from './components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Textarea } from './components/ui/textarea'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { useToast } from './hooks/use-toast'
import { Toaster } from './components/ui/toaster'
import blink from './blink/client'

interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  vibeScore: number
  isArtist: boolean
  walletAddress?: string
}

interface Post {
  id: string
  userId: string
  content: string
  imageUrl?: string
  musicTrackId?: string
  vibeScore: number
  positiveReactions: number
  negativeReactions: number
  createdAt: string
  author?: {
    displayName?: string
    isArtist: boolean
  }
  musicTrack?: {
    title: string
    price: number
    currency: string
    coverImageUrl?: string
  }
}

interface MusicTrack {
  id: string
  artistId: string
  title: string
  description?: string
  audioUrl?: string
  coverImageUrl?: string
  price: number
  currency: string
  totalSales: number
  vibeScore: number
  createdAt: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([])
  const [newPost, setNewPost] = useState('')
  const [newTrack, setNewTrack] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'ETH'
  })
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const [isCreateTrackOpen, setIsCreateTrackOpen] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      if (state.user) {
        await initializeUser(state.user)
        await loadPosts()
        await loadMusicTracks()
      }
    })
    return unsubscribe
  }, [])

  const initializeUser = async (authUser: any) => {
    try {
      // Check if user exists in database
      const existingUsers = await blink.db.users.list({
        where: { id: authUser.id },
        limit: 1
      })

      if (existingUsers.length === 0) {
        // Create new user record
        await blink.db.users.create({
          id: authUser.id,
          email: authUser.email,
          displayName: authUser.displayName || authUser.email.split('@')[0],
          vibeScore: 50,
          isArtist: false
        })
      }
    } catch (error) {
      console.error('Error initializing user:', error)
    }
  }

  const loadPosts = async () => {
    try {
      const postsData = await blink.db.posts.list({
        orderBy: { vibeScore: 'desc' },
        limit: 20
      })

      // Load additional data for each post
      const enrichedPosts = await Promise.all(
        postsData.map(async (post) => {
          const [userData, trackData] = await Promise.all([
            blink.db.users.list({ where: { id: post.userId }, limit: 1 }),
            post.musicTrackId ? blink.db.musicTracks.list({ where: { id: post.musicTrackId }, limit: 1 }) : Promise.resolve([])
          ])

          return {
            ...post,
            author: userData[0] ? {
              displayName: userData[0].displayName,
              isArtist: Number(userData[0].isArtist) > 0
            } : undefined,
            musicTrack: trackData[0] ? {
              title: trackData[0].title,
              price: trackData[0].price,
              currency: trackData[0].currency,
              coverImageUrl: trackData[0].coverImageUrl
            } : undefined
          }
        })
      )

      setPosts(enrichedPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
    }
  }

  const loadMusicTracks = async () => {
    try {
      const tracks = await blink.db.musicTracks.list({
        orderBy: { vibeScore: 'desc' },
        limit: 12
      })
      setMusicTracks(tracks)
    } catch (error) {
      console.error('Error loading music tracks:', error)
    }
  }

  const createPost = async () => {
    if (!user || !newPost.trim()) return

    try {
      const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await blink.db.posts.create({
        id: postId,
        userId: user.id,
        content: newPost,
        vibeScore: 50,
        positiveReactions: 0,
        negativeReactions: 0
      })

      setNewPost('')
      setIsCreatePostOpen(false)
      await loadPosts()
      
      toast({
        title: "Post created!",
        description: "Your vibe has been shared with the community.",
      })
    } catch (error) {
      console.error('Error creating post:', error)
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      })
    }
  }

  const createMusicTrack = async () => {
    if (!user || !newTrack.title.trim() || !newTrack.price) return

    try {
      const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await blink.db.musicTracks.create({
        id: trackId,
        artistId: user.id,
        title: newTrack.title,
        description: newTrack.description,
        price: parseFloat(newTrack.price),
        currency: newTrack.currency,
        totalSales: 0,
        vibeScore: 50
      })

      // Update user to be an artist
      await blink.db.users.update(user.id, { isArtist: true })

      setNewTrack({ title: '', description: '', price: '', currency: 'ETH' })
      setIsCreateTrackOpen(false)
      await loadMusicTracks()
      
      toast({
        title: "Track uploaded!",
        description: "Your music is now available on the marketplace.",
      })
    } catch (error) {
      console.error('Error creating track:', error)
      toast({
        title: "Error",
        description: "Failed to upload track. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleReaction = async (postId: string, type: 'positive' | 'negative', emoji: string) => {
    if (!user) return

    try {
      // Check if user already reacted to this post
      const existingReactions = await blink.db.reactions.list({
        where: { 
          AND: [
            { userId: user.id },
            { postId: postId }
          ]
        },
        limit: 1
      })

      if (existingReactions.length > 0) {
        toast({
          title: "Already reacted",
          description: "You can only react once per post.",
          variant: "destructive"
        })
        return
      }

      // Create reaction
      const reactionId = `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await blink.db.reactions.create({
        id: reactionId,
        userId: user.id,
        postId: postId,
        type: type,
        emoji: emoji
      })

      // Update post reaction counts
      const post = posts.find(p => p.id === postId)
      if (post) {
        const newPositive = type === 'positive' ? post.positiveReactions + 1 : post.positiveReactions
        const newNegative = type === 'negative' ? post.negativeReactions + 1 : post.negativeReactions
        const total = newPositive + newNegative
        const newVibeScore = total > 0 ? Math.round((newPositive / total) * 100) : 50

        await blink.db.posts.update(postId, {
          positiveReactions: newPositive,
          negativeReactions: newNegative,
          vibeScore: newVibeScore
        })

        await loadPosts()
      }

      toast({
        title: "Reaction added!",
        description: `You ${type === 'positive' ? 'boosted' : 'lowered'} this post's vibe.`,
      })
    } catch (error) {
      console.error('Error adding reaction:', error)
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handlePlayTrack = (trackId: string) => {
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null)
    } else {
      setCurrentlyPlaying(trackId)
      // TODO: Implement actual audio playback
      toast({
        title: "Playing track",
        description: "Audio playback would start here in a full implementation.",
      })
    }
  }

  const getVibeColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 to-amber-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading VibeUp...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900/20 to-amber-900/20 flex items-center justify-center">
        <Card className="vibe-card max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <div className="vibe-gradient w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">VibeUp</h1>
            <p className="text-white/70">Where positive vibes elevate music</p>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => blink.auth.login()} 
              className="w-full vibe-gradient text-white font-medium"
            >
              Join the Vibe
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 to-amber-900/20">
      <Toaster />
      
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="vibe-gradient w-10 h-10 rounded-full flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">VibeUp</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
            <Avatar>
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="bg-purple-600 text-white">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="feed" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-white/10">
            <TabsTrigger value="feed" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              Vibe Feed
            </TabsTrigger>
            <TabsTrigger value="music" className="data-[state=active]:bg-purple-600">
              <Music className="w-4 h-4 mr-2" />
              Music Market
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-8">
            <div className="space-y-6">
              {/* Create Post Button */}
              <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                <DialogTrigger asChild>
                  <Card className="vibe-card cursor-pointer hover:bg-card/70 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {user.email?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-white/70">
                          Share your vibe with the community...
                        </div>
                        <Plus className="w-5 h-5 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="vibe-card">
                  <DialogHeader>
                    <DialogTitle className="text-white">Share Your Vibe</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="What's your vibe today?"
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="bg-black/20 border-white/10 text-white placeholder:text-white/50"
                      rows={4}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreatePostOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createPost} className="vibe-gradient text-white">
                        Share Vibe
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Posts */}
              {posts.map((post) => (
                <Card key={post.id} className="vibe-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`} />
                          <AvatarFallback className="bg-purple-600 text-white">
                            {post.userId[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-white">
                            {post.author?.displayName || `User ${post.userId.slice(0, 8)}`}
                            {post.author?.isArtist && (
                              <Badge variant="secondary" className="ml-2 bg-amber-500/20 text-amber-300">
                                Artist
                              </Badge>
                            )}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`${getVibeColor(post.vibeScore)} border-current`}>
                              Vibe Score: {post.vibeScore}%
                            </Badge>
                            <span className="text-xs text-white/50">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Progress 
                          value={post.vibeScore} 
                          className="w-20 h-2"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-white/90">{post.content}</p>
                    
                    {post.musicTrack && (
                      <Card className="bg-gradient-to-r from-purple-600/20 to-amber-600/20 border-purple-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePlayTrack(post.musicTrackId!)}
                                className="w-10 h-10 rounded-full p-0 bg-purple-500/20 border-purple-500/30"
                              >
                                {currentlyPlaying === post.musicTrackId ? (
                                  <Pause className="w-4 h-4 text-purple-300" />
                                ) : (
                                  <Play className="w-4 h-4 text-purple-300" />
                                )}
                              </Button>
                              <div>
                                <h4 className="font-semibold text-white">{post.musicTrack.title}</h4>
                                <p className="text-white/70 text-sm">NFT Music Track</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-amber-400 font-bold">{post.musicTrack.price} {post.musicTrack.currency}</p>
                              <Button size="sm" className="vibe-gradient text-white">
                                Buy Track
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(post.id, 'positive', '❤️')}
                          className="text-white/70 hover:text-red-400 hover:bg-red-400/10"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          {post.positiveReactions}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(post.id, 'positive', '🔥')}
                          className="text-white/70 hover:text-amber-400 hover:bg-amber-400/10"
                        >
                          <Flame className="w-4 h-4 mr-1" />
                          Fire
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(post.id, 'positive', '✨')}
                          className="text-white/70 hover:text-purple-400 hover:bg-purple-400/10"
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          Vibe
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(post.id, 'negative', '👎')}
                        className="text-white/70 hover:text-red-400 hover:bg-red-400/10"
                      >
                        <ThumbsDown className="w-4 h-4 mr-1" />
                        {post.negativeReactions}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="music" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {musicTracks.map((track) => (
                <Card key={track.id} className="vibe-card hover:bg-card/70 transition-colors group">
                  <CardHeader className="pb-3">
                    <div className="relative">
                      {track.coverImageUrl ? (
                        <img 
                          src={track.coverImageUrl} 
                          alt={track.title}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-purple-500/20 to-amber-500/20 rounded-lg flex items-center justify-center">
                          <Music className="w-16 h-16 text-purple-300" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                        <Button
                          size="lg"
                          onClick={() => handlePlayTrack(track.id)}
                          className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
                        >
                          {currentlyPlaying === track.id ? (
                            <Pause className="w-8 h-8 text-white" />
                          ) : (
                            <Play className="w-8 h-8 text-white ml-1" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-purple-500/80 text-white border-purple-500">
                          NFT
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg text-white truncate">{track.title}</h3>
                      <p className="text-sm text-white/70">
                        Artist {track.artistId.slice(0, 8)}
                      </p>
                      {track.description && (
                        <p className="text-sm text-white/60 mt-2 line-clamp-2">
                          {track.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className={`${getVibeColor(track.vibeScore)} border-current`}>
                          Vibe {track.vibeScore}
                        </Badge>
                        <span className="text-sm text-white/50">
                          {track.totalSales} sales
                        </span>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-amber-400 font-bold text-lg">
                          {track.price} {track.currency}
                        </p>
                        <Button size="sm" className="vibe-gradient text-white">
                          Buy Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create Post */}
              <Card className="vibe-card">
                <CardHeader>
                  <h2 className="text-xl font-bold text-white">Share Your Vibe</h2>
                  <p className="text-white/70">Create a post to share with the community</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="What's your vibe today?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="bg-black/20 border-white/10 text-white placeholder:text-white/50"
                    rows={4}
                  />
                  <Button onClick={createPost} className="w-full vibe-gradient text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Share Vibe
                  </Button>
                </CardContent>
              </Card>

              {/* Upload Music */}
              <Dialog open={isCreateTrackOpen} onOpenChange={setIsCreateTrackOpen}>
                <DialogTrigger asChild>
                  <Card className="vibe-card cursor-pointer hover:bg-card/70 transition-colors">
                    <CardHeader>
                      <h2 className="text-xl font-bold text-white">Upload Music</h2>
                      <p className="text-white/70">Share your music as NFTs and earn directly</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center py-8">
                        <Upload className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                        <Button className="vibe-gradient text-white">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Track
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="vibe-card max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-white">Upload Music Track</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-white">Track Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter track title"
                        value={newTrack.title}
                        onChange={(e) => setNewTrack({ ...newTrack, title: e.target.value })}
                        className="bg-black/20 border-white/10 text-white placeholder:text-white/50"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-white">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your track"
                        value={newTrack.description}
                        onChange={(e) => setNewTrack({ ...newTrack, description: e.target.value })}
                        className="bg-black/20 border-white/10 text-white placeholder:text-white/50"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price" className="text-white">Price</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.001"
                          placeholder="0.05"
                          value={newTrack.price}
                          onChange={(e) => setNewTrack({ ...newTrack, price: e.target.value })}
                          className="bg-black/20 border-white/10 text-white placeholder:text-white/50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency" className="text-white">Currency</Label>
                        <Input
                          id="currency"
                          value={newTrack.currency}
                          onChange={(e) => setNewTrack({ ...newTrack, currency: e.target.value })}
                          className="bg-black/20 border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateTrackOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createMusicTrack} className="vibe-gradient text-white">
                        Upload Track
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App