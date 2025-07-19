import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Play, Pause, ShoppingCart, Heart, Verified, Music } from 'lucide-react'
import { MusicTrack } from '@/types'

interface MusicCardProps {
  track: MusicTrack
  onPurchase: (trackId: string) => void
  onPlay: (trackId: string) => void
}

export function MusicCard({ track, onPurchase, onPlay }: MusicCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    onPlay(track.id)
  }

  const getVibeColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-400/20 border-green-400/30'
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30'
    if (score >= 40) return 'text-orange-400 bg-orange-400/20 border-orange-400/30'
    return 'text-red-400 bg-red-400/20 border-red-400/30'
  }

  return (
    <Card className="vibe-card hover:bg-card/70 transition-all duration-300 group">
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
              onClick={handlePlayPause}
              className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" />
              )}
            </Button>
          </div>
          
          <div className="absolute top-3 right-3 flex space-x-2">
            <Badge variant="secondary" className="bg-purple-500/80 text-white border-purple-500">
              NFT
            </Badge>
            {track.isOwned && (
              <Badge className={`${getVibeColor(track.vibeScore)} font-medium`}>
                Owned
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg truncate">{track.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 ${isLiked ? 'text-red-400' : 'text-muted-foreground'}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mt-1">
            <Avatar className="w-6 h-6">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${track.artistId}`} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-amber-500 text-white text-xs">
                {track.artistId[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              Artist {track.artistId.slice(0, 8)}
            </span>
            <Verified className="w-4 h-4 text-blue-400" />
          </div>
          
          {track.description && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {track.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge className={`${getVibeColor(track.vibeScore)} font-medium`}>
              Vibe {track.vibeScore}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {track.totalSales} sales
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-amber-400">
              {track.price} {track.currency}
            </span>
            {!track.isOwned && (
              <Button
                size="sm"
                onClick={() => onPurchase(track.id)}
                className="bg-gradient-to-r from-purple-500 to-amber-500 hover:from-purple-600 hover:to-amber-600 text-white"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                Buy
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}