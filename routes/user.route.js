import { Router } from "express";
import {
  getUserById,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middlerware.js";
import verifyJWT from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/:userId").get(verifyJWT, getUserById);

export default router;
