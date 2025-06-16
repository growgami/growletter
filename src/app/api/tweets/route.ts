import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@prisma/client'
import { getCategoryByClientId } from '@/constants/client-list/clients'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const cursor = searchParams.get('cursor'); // Tweet ID for cursor-based pagination
    const tag = searchParams.get('tag');
    const clientId = searchParams.get('client'); // New client parameter
    const searchQuery = searchParams.get('search')?.trim(); // New search parameter
    const offset = parseInt(searchParams.get('offset') || '0', 10); // Keep for backward compatibility

    console.log('📊 API Request:', { limit, cursor, offset, hasCursor: !!cursor, tag, clientId, searchQuery });

    let tweets;
    const whereClause: Prisma.TweetWhereInput = {};

    // Handle client-based filtering
    if (clientId) {
      const clientIdNum = parseInt(clientId, 10);
      const clientCategory = getCategoryByClientId(clientIdNum);
      
      if (clientCategory) {
        // Filter by exact category match
        whereClause.category = clientCategory;
        console.log('🏷️ Filtering by client category:', clientCategory);
      } else {
        console.log('⚠️ Unknown client ID:', clientId);
      }
    }

    // Handle tag-based filtering (existing functionality)
    if (tag) {
      // Use case-insensitive matching for tag to avoid case sensitivity issues
      whereClause.tag = {
        contains: tag
      };
    }

    // Handle search query filtering
    if (searchQuery) {
      // Add search conditions that work across tweet text, author name, and handle
      whereClause.OR = [
        {
          text: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        },
        {
          authorName: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        },
        {
          author: {
            contains: searchQuery,
            mode: 'insensitive'
          }
        }
      ];
      console.log('🔍 Adding search filter for:', searchQuery);
    }

    if (cursor && cursor !== 'null') { // Handle null string from frontend
      // Cursor-based pagination (preferred)
      tweets = await prisma.tweet.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        take: limit + 1, // Take one extra to check if there's more
        cursor: {
          id: cursor
        },
        skip: 1, // Skip the cursor item itself
      });
    } else {
      // Initial load or fallback to offset-based pagination
      tweets = await prisma.tweet.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        take: limit + 1, // Take one extra to check if there's more
        skip: offset
      });
    }

    // Check if there are more tweets
    const hasMore = tweets.length > limit;
    const tweetsToReturn = hasMore ? tweets.slice(0, -1) : tweets;
    const nextCursor = hasMore ? tweetsToReturn[tweetsToReturn.length - 1]?.id : null;

    // Transform to match a richer ContentCards expected format
    const formattedTweets = tweetsToReturn.map((tweet) => ({
      id: tweet.id,
      title: tweet.text, // Using the full tweet text as the title
      embedType: 'twitter' as const,
      embedUrl: tweet.tweetUrl,
      createdAt: tweet.createdAt.toISOString(),
      category: tweet.category,
      tag: tweet.tag,
      author: {
        name: tweet.author,
        pfp: tweet.authorPfp,
      },
      // Optional fields for future expansion
      banner: undefined,
      alt: tweet.text, // Use the tweet text for alt text as well
    }));

    const response = {
      tweets: formattedTweets,
      hasMore,
      nextCursor,
      total: tweetsToReturn.length,
      // Include pagination info for debugging
      pagination: {
        method: cursor && cursor !== 'null' ? 'cursor' : 'offset',
        cursor,
        tag,
        clientId,
        offset,
        limit,
        returned: formattedTweets.length
      }
    };

    console.log('📤 API Response:', {
      tweetsCount: formattedTweets.length,
      hasMore,
      nextCursor,
      tag,
      clientId,
      method: cursor && cursor !== 'null' ? 'cursor' : 'offset'
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    console.error('❌ Error fetching tweets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweets' },
      { status: 500 }
    );
  }
} 