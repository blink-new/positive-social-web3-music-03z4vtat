import { useState, useEffect } from 'react'
import { Heart, Flame, Sparkles, ThumbsDown, Music, Plus, TrendingUp, Wallet } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardContent, CardHeader } from './components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar'
import { Badge } from './components/ui/badge'
import { Progress } from './components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import blink from './blink/client'

interface Post {
  id: string
  content: string
  author: string
  avatar: string
  vibeScore: number
  positiveReactions: number
  negativeReactions: number
  musicTrack?: {
    title: string
    artist: string
    price: number
    owned: boolean
  }
}

interface User {
  id: string
  email: string
  displayName?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      content: 'Just dropped my new track! 🎵 This beat took me weeks to perfect. Hope it brings good vibes to your day! ✨',
      author: 'SoundWave',
      avatar: 'SW',
      vibeScore: 85,
      positiveReactions: 142,
      negativeReactions: 8,
      musicTrack: {
        title: 'Cosmic Dreams',
        artist: 'SoundWave',
        price: 0.05,
        owned: false
      }
    },
    {
      id: '2',
      content: 'The energy at tonight\'s virtual concert was incredible! Thank you to everyone who joined and supported independent artists 🙏',
      author: 'BeatMaker',
      avatar: 'BM',
      vibeScore: 92,
      positiveReactions: 89,
      negativeReactions: 3
    },
    {
      id: '3',
      content: 'Working on some new experimental sounds. Web3 is giving artists like me the freedom to create without limits! 🚀',
      author: 'VibeCreator',
      avatar: 'VC',
      vibeScore: 78,
      positiveReactions: 67,
      negativeReactions: 12,
      musicTrack: {
        title: 'Digital Horizon',
        artist: 'VibeCreator',
        price: 0.03,
        owned: true
      }
    }
  ])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleReaction = (postId: string, type: 'positive' | 'negative') => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newPost = { ...post }
        if (type === 'positive') {
          newPost.positiveReactions += 1
        } else {
          newPost.negativeReactions += 1
        }
        // Recalculate vibe score
        const total = newPost.positiveReactions + newPost.negativeReactions
        newPost.vibeScore = Math.round((newPost.positiveReactions / total) * 100)
        return newPost
      }
      return post
    }))
  }

  const getVibeColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
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
              {posts
                .sort((a, b) => b.vibeScore - a.vibeScore)
                .map((post) => (
                <Card key={post.id} className="vibe-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback className="bg-purple-600 text-white">
                            {post.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-white">{post.author}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`${getVibeColor(post.vibeScore)} border-current`}>
                              Vibe Score: {post.vibeScore}%
                            </Badge>
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
                              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                                <Music className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{post.musicTrack.title}</h4>
                                <p className="text-white/70 text-sm">{post.musicTrack.artist}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-amber-400 font-bold">{post.musicTrack.price} ETH</p>
                              {post.musicTrack.owned ? (
                                <Badge className="bg-green-600 text-white">Owned</Badge>
                              ) : (
                                <Button size="sm" className="vibe-gradient text-white">
                                  Buy Track
                                </Button>
                              )}
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
                          onClick={() => handleReaction(post.id, 'positive')}
                          className="text-white/70 hover:text-green-400 hover:bg-green-400/10"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          {post.positiveReactions}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(post.id, 'positive')}
                          className="text-white/70 hover:text-amber-400 hover:bg-amber-400/10"
                        >
                          <Flame className="w-4 h-4 mr-1" />
                          Fire
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReaction(post.id, 'positive')}
                          className="text-white/70 hover:text-purple-400 hover:bg-purple-400/10"
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          Vibe
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReaction(post.id, 'negative')}
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
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Web3 Music Marketplace</h2>
              <p className="text-white/70 mb-6">Discover and own music directly from artists</p>
              <Button className="vibe-gradient text-white">
                Explore Marketplace
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-8">
            <div className="text-center py-12">
              <Plus className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Create & Share</h2>
              <p className="text-white/70 mb-6">Upload your music and share your vibes</p>
              <Button className="vibe-gradient text-white">
                Start Creating
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default App