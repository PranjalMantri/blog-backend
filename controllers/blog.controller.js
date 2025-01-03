import { createBlogSchema } from "../validation/blog.validation.js";
import { Users } from "../models/user.model.js";
import { Blogs } from "../models/blog.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

// create a blog
const createBlog = async (req, res) => {
  // create a blog object
  // get blog data
  const validatedData = createBlogSchema.safeParse(req.body);

  if (!validatedData.success) {
    return res.status(404).json({
      success: false,
      message: validatedData.error.errors
        .map((error) => error.messsage)
        .join(". "),
    });
  }

  const { title, content, tags, published } = validatedData.data;

  // valdiate user
  const user = await Users.findById(req.userId);

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  const existingBlog = await Blogs.findOne({ title });

  if (existingBlog) {
    return res.status(500).json({
      success: false,
      message: "Blog with similar title already exists",
    });
  }

  // uploadImage on cloudinary
  if (!req.file) {
    return res
      .status(404)
      .json({ success: false, message: "Blog Cover Image is required" });
  }

  let coverImage = req.file;

  coverImage = await uploadOnCloudinary(coverImage.path);

  if (!coverImage) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while uploading cover image to cloudinary",
    });
  }

  const blog = await Blogs.create({
    title: title,
    content: content,
    tags: tags || [],
    published: published || false,
    author: req.userId,
    blogImage: {
      url: coverImage.url,
      public_id: coverImage.public_id,
    },
  });

  return res
    .status(200)
    .json({ success: true, message: "Successfuly created a blog", data: blog });
};

// update blog details
const updateBlog = async (req, res) => {
  // get blog details and update it
  const validatedData = createBlogSchema.safeParse(req.body);
  const blogId = req.params.blogId.trim();

  if (!validatedData.success) {
    return res.status(404).json({
      success: false,
      message: validatedData.error.errors
        .map((error) => error.messsage)
        .join(". "),
    });
  }

  const { title, content } = validatedData.data;

  // valdiate user
  const user = await Users.findById(req.userId);

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  const blog = await Blogs.findById(blogId);

  if (!blog) {
    return res.status(400).json({ success: false, message: "Blog not found" });
  }

  blog.title = title;
  blog.content = content;
  await blog.save({ validateBeforeSave: true });

  return res.status(200).json({
    success: true,
    message: "Successfuly updated blog data",
    data: blog,
  });
};

// update blog image
const updateBlogImage = async (req, res) => {
  // get new file
  if (!req.file) {
    return res
      .status(404)
      .json({ success: false, message: "Cover Image is required" });
  }

  const blogId = req.params.blogId.trim();

  const blog = await Blogs.findById(blogId);

  if (!blog) {
    return res.status(400).json({ success: false, message: "Blog not found" });
  }

  console.log(blog);

  const oldblogImage = blog.blogImage;

  let blogImage = req.file;
  blogImage = await uploadOnCloudinary(blogImage.path);

  if (!blogImage) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong while updating the cover Image",
    });
  }

  blog.blogImage = {
    url: blogImage.url,
    public_id: blogImage.public_id,
  };

  await blog.save();

  console.log(oldblogImage);
  const deletedblogImage = await deleteFromCloudinary(oldblogImage.public_id);

  if (!deletedblogImage) {
    return res.status(500).json({
      success: true,
      message: "Something went wrong while deleting the old cover image",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly updated user avatar",
    data: blog,
  });
  // upload new file, delete old file
};

const updateBlogTags = async (req, res) => {
  // get blog tags and update them
  const { tags } = req.body;
  const blogId = req.params.blogId.trim();

  if (!tags || tags.length < 1) {
    return res
      .status(404)
      .json({ success: false, message: "Tags are required" });
  }

  // valdiate user
  const user = await Users.findById(req.userId);

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  // get blog
  const blog = await Blogs.findById(blogId);

  if (!blog) {
    return res.status(400).json({ success: false, message: "Blog not found" });
  }

  blog.tags = tags;
  await blog.save({ validateBeforeSave: true });

  return res.status(200).json({
    success: true,
    message: "Successfuly updated blog tags",
    data: blog,
  });
};

// get blog by id
const getBlogById = async (req, res) => {
  //get blog id and fetch details
  const blogId = req.params.blogId.trim();

  // get blog
  const blog = await Blogs.findById(blogId);

  if (!blog) {
    return res.status(400).json({ success: false, message: "Blog not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly fetched the blog with given Id",
    data: blog,
  });
};

const getBlogByAuthor = async (req, res) => {
  // get author id and search for all the blogs where that user is blof
  const userId = req.userId;

  const blogs = await Blogs.find({
    author: new mongoose.Types.ObjectId(userId),
  });

  if (!blogs || blogs.length < 1) {
    return res.status(200).json({
      success: true,
      message: "User has written no blogs",
      data: blogs,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly fetched user blogs",
    data: blogs,
  });
};

// list all blogs
const getAllBlogs = async (req, res) => {
  // get all blogs by all users
  const blogs = await Blogs.find({});

  if (!blogs || blogs.length < 1) {
    return res.status(200).json({
      success: false,
      message: "There are no blogs to be fetched",
      data: blogs,
    });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly fetched all the blogs",
    data: blogs,
  });
};

const getAllPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blogs.find({ published: true });

    if (!blogs || blogs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No published blogs available",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully fetched all published blogs",
      data: blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching published blogs",
      error: error.message,
    });
  }
};

const getBlogByQuery = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const blogs = await Blogs.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ],
    });

    if (!blogs || blogs.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No blogs match the search query",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Successfully fetched blogs matching the query",
      data: blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while searching for blogs",
      error: error.message,
    });
  }
};

const toggleBlogPublish = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blogs.findById(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    blog.published = !blog.published;
    await blog.save();

    return res.status(200).json({
      success: true,
      message: `Blog has been successfully ${
        blog.published ? "published" : "unpublished"
      }`,
      data: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while toggling blog publish status",
      error: error.message,
    });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blogs.findOneAndDelete(blogId);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blog has been successfully deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the blog",
      error: error.message,
    });
  }
};

export {
  createBlog,
  updateBlog,
  updateBlogImage,
  updateBlogTags,
  getBlogById,
  getBlogByAuthor,
  getAllBlogs,
  getAllPublishedBlogs,
  getBlogByQuery,
  toggleBlogPublish,
  deleteBlog,
};
