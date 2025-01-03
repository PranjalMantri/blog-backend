import { Router } from "express";
import {
  changePassword,
  getUserById,
  getUserHistory,
  loginUser,
  logoutUser,
  registerUser,
  updateUserAvatar,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middlerware.js";
import verifyJWT from "../middlewares/auth.js";

const router = Router();

// Public routes
router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);

// Middleware for protected routes
router.use(verifyJWT);

// Static protected routes (must come before dynamic routes)
router.route("/logout").post(logoutUser);
router.route("/update-avatar").patch(upload.single("avatar"), updateUserAvatar);

// Dynamic protected routes
router.route("/:userId").get(getUserById);
router.route("/:userId/history").get(getUserHistory);
router.route("/:userId/password").put(changePassword);

export default router;
