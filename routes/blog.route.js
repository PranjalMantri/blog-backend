import { Router } from "express";
import {
  createBlog,
  getBlogByAuthor,
  getBlogById,
  updateBlog,
  updateBlogImage,
  updateBlogTags,
} from "../controllers/blog.controller.js";
import verifyJWT from "../middlewares/auth.js";
import upload from "../middlewares/multer.middlerware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(upload.single("coverImage"), createBlog);
router.route("/author").get(getBlogByAuthor);
router.route("/:blogId").patch(updateBlog);
router.route("/:blogId").get(getBlogById);
router
  .route("/:blogId/image")
  .put(upload.single("coverImage"), updateBlogImage);
router.route("/:blogId/tags").patch(updateBlogTags);

export default router;
