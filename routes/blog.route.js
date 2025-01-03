import { Router } from "express";
import {
  createBlog,
  getAllBlogs,
  getBlogByAuthor,
  getBlogById,
  updateBlog,
  updateBlogImage,
  updateBlogTags,
  getAllPublishedBlogs,
  getBlogByQuery,
  toggleBlogPublish,
  deleteBlog,
} from "../controllers/blog.controller.js";
import verifyJWT from "../middlewares/auth.js";
import upload from "../middlewares/multer.middlerware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(upload.single("coverImage"), createBlog);
router.route("/").get(getAllBlogs);
router.route("/author").get(getBlogByAuthor);
router.route("/published").get(getAllPublishedBlogs);
router.route("/search").get(getBlogByQuery);
router.route("/:blogId").patch(updateBlog);
router.route("/:blogId").get(getBlogById);
router
  .route("/:blogId/image")
  .put(upload.single("coverImage"), updateBlogImage);
router.route("/:blogId/tags").patch(updateBlogTags);
router.route("/:blogId/publish").patch(toggleBlogPublish);
router.route("/:blogId").delete(deleteBlog);

export default router;
