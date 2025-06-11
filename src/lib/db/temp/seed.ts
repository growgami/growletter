import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

const prisma = new PrismaClient()

interface TweetCSVRow {
  id: string
  createdAt: string
  createdAt_iso: string
  text: string
  twitterUrl: string
  author_userName: string
  author_id: string
  author_name: string
  author_profilePicture: string
  author_followers: string
  category: string
  tags: string
}

async function main() {
  console.log('🌱 Starting to seed MongoDB database...')
  
  // Read the CSV file
  const csvPath = path.join(process.cwd(), 'data', 'tweets.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  
  // Parse CSV using csv-parse library for more reliable parsing
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_quotes: true
  }) as TweetCSVRow[]
  
  const tweets = records.filter(tweet => tweet.id && tweet.createdAt)
  
  console.log(`📝 Found ${tweets.length} tweets to import`)
  
  // Log the column names from the first record to verify
  if (tweets.length > 0) {
    console.log('CSV Columns:', Object.keys(tweets[0]))
  }
  
  // Log a few sample tweets to verify data
  console.log('Sample tweets:')
  tweets.slice(0, 3).forEach((tweet, i) => {
    console.log(`Tweet ${i + 1}:`, {
      id: tweet.id,
      authorId: tweet.author_id,
      author: tweet.author_userName
    })
  })
  
  // Clear existing data
  await prisma.tweet.deleteMany()
  console.log('🗑️ Cleared existing tweets from MongoDB')
  
  // Insert tweets in batches
  const batchSize = 100
  for (let i = 0; i < tweets.length; i += batchSize) {
    const batch = tweets.slice(i, i + batchSize)
    
    try {
      // For MongoDB, we need to use createMany differently
      // MongoDB doesn't support native batch operations via Prisma yet
      // So we'll use individual creates with a transaction
      await prisma.$transaction(
        batch.map(tweet => 
          prisma.tweet.create({
            data: {
              id: tweet.id,
              createdAt: new Date(tweet.createdAt),
              tweetUrl: tweet.twitterUrl,
              text: tweet.text,
              category: tweet.category || 'General',
              tag: tweet.tags || 'All',
              authorId: tweet.author_id,
              author: tweet.author_userName,
              authorName: tweet.author_name || tweet.author_userName,
              authorPfp: tweet.author_profilePicture,
              authorFollowers: parseInt(tweet.author_followers) || 0
            }
          })
        )
      )
      
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tweets.length / batchSize)}`)
    } catch (error) {
      console.error('Error inserting batch:', error)
      
      // Log the problematic records
      batch.forEach((tweet, idx) => {
        console.log(`Record ${i + idx}:`, JSON.stringify(tweet))
      })
      
      throw error
    }
  }
  
  // Verify all author IDs were correctly stored
  const authorIds = await prisma.tweet.findMany({
    select: {
      id: true,
      authorId: true,
      author: true
    }
  })
  
  console.log(`Verifying all ${authorIds.length} author IDs:`)
  authorIds.forEach(tweet => {
    console.log(`Tweet ${tweet.id} -> Author: ${tweet.author}, AuthorId: ${tweet.authorId}`)
  })
  
  // Count tweets by authorId to verify distribution
  // MongoDB requires a different approach for aggregation
  const authorCounts = await prisma.tweet.groupBy({
    by: ['authorId', 'author'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    }
  })
  
  console.log('Author ID distribution:')
  console.log(authorCounts.map(count => ({
    authorId: count.authorId,
    count: count._count.id,
    author: count.author
  })))
  
  console.log('🎉 MongoDB database seeded successfully!')
  
  // Verify the data
  const count = await prisma.tweet.count()
  console.log(`📊 Total tweets in MongoDB: ${count}`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding MongoDB database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
