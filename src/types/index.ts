export interface User {
  id: string
  email: string
  displayName?: string
  avatar?: string
  vibeScore: number
  isArtist: boolean
  walletAddress?: string
  createdAt: string
}

export interface Post {
  id: string
  userId: string
  content: string
  imageUrl?: string
  musicTrackId?: string
  vibeScore: number
  positiveReactions: number
  negativeReactions: number
  createdAt: string
  updatedAt: string
}

export interface MusicTrack {
  id: string
  artistId: string
  title: string
  description?: string
  audioUrl: string
  coverImageUrl?: string
  price: number
  currency: string
  nftTokenId?: string
  isOwned: boolean
  totalSales: number
  vibeScore: number
  createdAt: string
}

export interface Reaction {
  id: string
  userId: string
  postId: string
  type: 'positive' | 'negative'
  emoji: string
  createdAt: string
}

export interface Purchase {
  id: string
  buyerId: string
  trackId: string
  price: number
  currency: string
  transactionHash?: string
  createdAt: string
}