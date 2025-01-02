import express, { json, urlencoded } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

import userRouter from "./routes/user.route.js";

app.use("/api/v1/users", userRouter);

export default app;
