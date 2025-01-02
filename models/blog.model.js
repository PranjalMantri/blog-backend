import mongoose, { mongo } from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [
    {
      type: String,
    },
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  published: {
    type: Boolean,
    default: false,
  },
  timestamps: true,
});

export const Blogs = mongoose.model("Blog", blogSchema);