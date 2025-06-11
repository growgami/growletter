import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const cursor = searchParams.get('cursor');
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Search API Request:', { query, limit, cursor, offset });

    // Build the search conditions
    const searchConditions: Prisma.TweetWhereInput = {
      OR: [
        {
          text: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          authorName: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          author: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ]
    };

    let tweets;

    if (cursor && cursor !== 'null') {
      // Cursor-based pagination
      tweets = await prisma.tweet.findMany({
        where: searchConditions,
        orderBy: [
          { createdAt: 'desc' },
          { id: 'asc' } // Secondary sort for consistency
        ],
        take: limit + 1,
        cursor: {
          id: cursor
        },
        skip: 1,
      });
    } else {
      // Initial load or offset-based pagination
      tweets = await prisma.tweet.findMany({
        where: searchConditions,
        orderBy: [
          { createdAt: 'desc' },
          { id: 'asc' }
        ],
        take: limit + 1,
        skip: offset
      });
    }

    // Check if there are more results
    const hasMore = tweets.length > limit;
    const tweetsToReturn = hasMore ? tweets.slice(0, -1) : tweets;
    const nextCursor = hasMore ? tweetsToReturn[tweetsToReturn.length - 1]?.id : null;

    // Get total count for the search query
    const totalCount = await prisma.tweet.count({
      where: searchConditions
    });

    // Format the response to match your existing tweet structure
    const formattedTweets = tweetsToReturn.map((tweet) => ({
      id: tweet.id,
      title: tweet.text,
      embedType: 'twitter' as const,
      embedUrl: tweet.tweetUrl,
      createdAt: tweet.createdAt.toISOString(),
      category: tweet.category,
      tag: tweet.tag,
      author: {
        name: tweet.author,
        pfp: tweet.authorPfp,
      },
      banner: undefined,
      alt: tweet.text,
      // Include author info for search highlighting if needed
      authorName: tweet.authorName,
      authorHandle: tweet.author,
    }));

    console.log(`🔍 Search completed: Found ${totalCount} total results, returning ${formattedTweets.length} tweets`);

    return NextResponse.json({
      tweets: formattedTweets,
      hasMore,
      nextCursor,
      total: totalCount,
      query,
      pagination: {
        method: cursor ? 'cursor' : 'offset',
        cursor: nextCursor,
        offset,
        limit,
        returned: formattedTweets.length,
      }
    });

  } catch (error) {
    console.error('❌ Error in search API:', error);
    return NextResponse.json(
      { error: 'Failed to search tweets' },
      { status: 500 }
    );
  }
} 