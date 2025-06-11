import mongoose, { Schema, Document } from 'mongoose';

export interface IUpvote extends Document {
  author_id: string;
  author: string;
  author_name: string;
  upvote_count: number;
  createdAt: Date;
  updatedAt: Date;
}

const UpvoteSchema: Schema = new Schema(
  {
    author_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      index: true,
    },
    author_name: {
      type: String,
      required: true,
    },
    upvote_count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'counts', // This matches your MongoDB collection name
  }
);

// Create compound index for better query performance
UpvoteSchema.index({ author_id: 1, author: 1 });

export default mongoose.models.Upvote || mongoose.model<IUpvote>('Upvote', UpvoteSchema); 