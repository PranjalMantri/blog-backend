import { Router } from "express";
import {
  addToFavourites,
  changePassword,
  deleteUser,
  getFavourites,
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
router.route("/favourite/:blogId").post(addToFavourites);
router.route("/favourite").get(getFavourites);

router.route("/history").get(getUserHistory);
router.route("/password").put(changePassword);
router.route("/delete").delete(deleteUser);

// Dynamic protected routes
router.route("/:userId").get(getUserById);

export default router;
