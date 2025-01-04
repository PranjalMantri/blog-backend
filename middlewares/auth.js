import jwt from "jsonwebtoken";
import { Users } from "../models/user.model.js";

const verifyJWT = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // If no token, unauthorized access
    if (!token) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized request: No token provided",
        });
    }

    // Decode token and set the req.userId as user._id
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await Users.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid access token" });
    }

    req.userId = user._id;
    next();
  } catch (error) {
    console.log("Error while verifying user", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Invalid access token",
      });
    }

    // For any other errors
    return res.status(500).json({
      success: false,
      message: "Internal server error while verifying token",
    });
  }
};

export default verifyJWT;
