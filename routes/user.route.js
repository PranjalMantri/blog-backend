import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middlerware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);

export default router;
