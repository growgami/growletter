import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    console.log('📊 Fetching author analytics...')

    // Get aggregated author data with real names and follower counts
    const authorStats = await prisma.tweet.groupBy({
      by: ['authorId', 'author', 'authorName', 'authorPfp', 'authorFollowers'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    })

    // Transform the data to match the Author interface exactly
    const authors = authorStats.map((stat, index) => ({
      id: index + 1,
      authorId: stat.authorId, // Include the actual Twitter author ID
      name: stat.authorName, // Use real author name
      handle: stat.author, // Use author handle (username)
      pfp: stat.authorPfp || '',
      followers: formatFollowerCount(stat.authorFollowers), // Format follower count
      tweets: stat._count.id,
      engagement: `${generateEngagementRate()}%`, // Include percentage sign
      verified: index < 10, // First 10 authors are "verified"
      upvotes: 0 // Will be populated from upvotes database
    }))

    console.log(`📤 Returning ${authors.length} authors`)

    return NextResponse.json({ authors }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('❌ Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}

// Helper function to format follower count
function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  } else if (count >= 1000) {
    return `${Math.floor(count / 1000)}K`
  }
  return count.toString()
}

// Helper functions for fields we still need to generate
function generateEngagementRate(): number {
  return Math.floor(Math.random() * 10) + 1 // 1-10%
} 