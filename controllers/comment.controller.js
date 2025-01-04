import { Blogs } from "../models/blog.model.js";
import { Comments } from "../models/comment.js";

const addComment = async (req, res) => {
  // get text content and create comment
  const { text } = req.body;
  const { blogId } = req.params.blogId.trim();

  const blog = await Blogs.findById(blogId);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  if (!text || text.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Comment text cannot be empty",
    });
  }

  const comment = await Comments.create({
    content: text,
    blog: blogId,
    author: req.userId,
  });

  if (!comment) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating a user",
    });
  }

  return res.status(201).json({
    success: true,
    message: "Comment created successfully",
    data: comment,
  });
};

const deleteComment = async (req, res) => {
  // get commentId and delete the comment
  const { commentId } = req.params;
  const { resourceId } = req.body;

  // Find the comment by ID
  const comment = await Comments.findById(commentId);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: "Comment not found",
    });
  }

  // Check if the comment belongs to the logged-in user (or if they are an admin)
  if (comment.user.toString() !== req.userId.toString()) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to delete this comment",
    });
  }

  const deletedComment = await Comments.findOneAndDelete({ _id: commentId });

  if (!deletedComment) {
    return res.status(403).json({
      success: false,
      message: "Something went wrong while deleting the comment",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
  });
};

const getAllComments = async (req, res) => {
  // get blogId and retreive all the comments on the blog
  const { blogId } = req.params;

  const blog = await Blogs.findById(blogId);

  if (!blog) {
    return res.status(404).json({
      success: false,
      message: "Blog not found",
    });
  }

  const comments = await Comments.find({ blog: blogId }).sort({
    createdAt: -1,
  });

  if (!comments.length) {
    return res.status(404).json({
      success: false,
      message: "No comments found for this resource",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Comments retrieved successfully",
    data: comments,
  });
};

export { addComment, deleteComment, getAllComments };
