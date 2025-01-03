import { Router } from "express";
import { createBlog } from "../controllers/blog.controller.js";
import verifyJWT from "../middlewares/auth.js";
import upload from "../middlewares/multer.middlerware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(upload.single("coverImage"), createBlog);

export default router;