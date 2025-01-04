import Router from "express";
import verifyJWT from "../middlewares/auth.js";
import {
  addComment,
  deleteComment,
  getAllComments,
} from "../controllers/comment.controller";

const router = Router();

router.use(verifyJWT);

router.route("/").delete(deleteComment);
router.route("/:blogId").get(getAllComments).post(addComment);

export default router();
