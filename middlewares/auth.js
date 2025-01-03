import jwt from "jsonwebtoken";
import { Users } from "../models/user.model.js";

const verifyJWT = async (req, res, next) => {
  try {
    // get token
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // if no token, unauthorized access
    if (!token) {
      return res
        .status(503)
        .json({ success: false, message: "Unauthorized request" });
    }

    // decode token, set the req.userId as user._id
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await Users.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res
        .status(400)
        .json({ success: false, messsage: "Invalid access token" });
    }

    req.userId = user._id;
    next();
  } catch (error) {
    console.log("Something went wrong while verifying user", error.message);
  }
};

export default verifyJWT;
