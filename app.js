import express, { json, urlencoded } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

import userRouter from "./routes/user.route.js";
import blogRouter from "./routes/blog.route.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/blogs", blogRouter);

export default app;
