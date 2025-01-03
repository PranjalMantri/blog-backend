import { Router } from "express";
import {
  createBlog,
  updateBlog,
  updateBlogImage,
} from "../controllers/blog.controller.js";
import verifyJWT from "../middlewares/auth.js";
import upload from "../middlewares/multer.middlerware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(upload.single("coverImage"), createBlog);
router.route("/:blogId").patch(updateBlog);
router
  .route("/:blogId/image")
  .put(upload.single("coverImage"), updateBlogImage);

export default router;
