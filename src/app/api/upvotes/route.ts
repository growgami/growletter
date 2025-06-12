import { NextResponse } from 'next/server';
import connectToUpvotesDB from '@/lib/db/mongoose';
import Upvote from '@/lib/db/models/upvote';

export async function GET() {
  try {
    await connectToUpvotesDB();
    
    const upvotes = await Upvote.find({}).sort({ upvote_count: -1 });
    
    return NextResponse.json({
      success: true,
      upvotes: upvotes,
    });
  } catch (error) {
    console.error('Error fetching upvotes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch upvotes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { author_id, author, author_name } = await request.json();
    
    if (!author_id || !author || !author_name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: author_id, author, author_name' },
        { status: 400 }
      );
    }

    await connectToUpvotesDB();
    
    // Use findOneAndUpdate with upsert to either increment existing or create new
    const updatedUpvote = await Upvote.findOneAndUpdate(
      { author_id: author_id },
      {
        $inc: { upvote_count: 1 },
        $setOnInsert: {
          author: author,
          author_name: author_name,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return NextResponse.json({
      success: true,
      upvote: updatedUpvote,
      message: 'Upvote recorded successfully',
    });
  } catch (error) {
    console.error('Error creating/updating upvote:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record upvote' },
      { status: 500 }
    );
  }
} 