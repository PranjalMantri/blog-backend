import { createBlogSchema } from "../validation/blog.validation.js";
import { Users } from "../models/user.model.js";
import { Blogs } from "../models/blog.model.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

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
  // update the blog tags
};

// get blog by id
const getBlogById = async (req, res) => {
  //get blog id and fetch details
};

const getBlogByAuthor = async (req, res) => {
  // get author id and search for all the blogs where that user is blof
};

// list all blogs
const getAllBlogs = async (req, res) => {
  // get all blogs by all users
};

const getAllPublishedBlogs = async (req, res) => {
  // get all published blogs by all users
};

// search blog (by title and tags)
const getBlogByQuery = async (req, res) => {
  // get the search query and return a list of relevant blogs
};

// publish/unpublish a blog
const toggleBlogPublish = async (req, res) => {
  // publish/unpublish a blog
};

// delete a blog
const deleteBlog = async (req, res) => {
  // delete the blog
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
