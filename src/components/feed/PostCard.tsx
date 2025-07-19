import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Heart, Zap, Flame, Star, Music, Play, Pause } from 'lucide-react'
import { Post } from '@/types'

interface PostCardProps {
  post: Post
  onReaction: (postId: string, type: 'positive' | 'negative', emoji: string) => void
}

export function PostCard({ post, onReaction }: PostCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  
  const positiveReactions = [
    { emoji: '❤️', icon: Heart, label: 'Love', color: 'text-red-400' },
    { emoji: '🔥', icon: Flame, label: 'Fire', color: 'text-orange-400' },
    { emoji: '⚡', icon: Zap, label: 'Energy', color: 'text-yellow-400' },
    { emoji: '⭐', icon: Star, label: 'Star', color: 'text-purple-400' },
  ]

  const getVibeColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-400/20 border-green-400/30'
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
    if (score >= 40) return 'text-orange-400 bg-orange-400/20 border-orange-400/30'
    return 'text-red-400 bg-red-400/20 border-red-400/30'
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // TODO: Implement actual audio playback
  }

  return (
    <Card className="vibe-card hover:bg-card/70 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.userId}`} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-amber-500 text-white">
                {post.userId[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">Artist {post.userId.slice(0, 8)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={`${getVibeColor(post.vibeScore)} font-medium`}>
            Vibe {post.vibeScore}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{post.content}</p>
        
        {post.imageUrl && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt="Post content" 
              className="w-full h-48 object-cover"
            />
          </div>
        )}
        
        {post.musicTrackId && (
          <div className="bg-gradient-to-r from-purple-500/10 to-amber-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePlayPause}
                className="w-10 h-10 rounded-full p-0 bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-purple-300" />
                ) : (
                  <Play className="w-4 h-4 text-purple-300" />
                )}
              </Button>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <Music className="w-4 h-4 text-purple-300" />
                  <span className="text-sm font-medium text-purple-300">
                    Track Preview
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click to play music preview
                </p>
              </div>
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                NFT
              </Badge>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-1">
            {positiveReactions.map((reaction) => {
              const Icon = reaction.icon
              return (
                <Button
                  key={reaction.emoji}
                  variant="ghost"
                  size="sm"
                  onClick={() => onReaction(post.id, 'positive', reaction.emoji)}
                  className={`h-8 px-2 hover:bg-purple-500/20 ${reaction.color}`}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              )
            })}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center space-x-1">
              <span className="text-green-400">+{post.positiveReactions}</span>
              <span>/</span>
              <span className="text-red-400">-{post.negativeReactions}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}