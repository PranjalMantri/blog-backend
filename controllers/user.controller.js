import { Users } from "../models/user.model.js";
import {
  registerUserSchema,
  loginUserSchema,
} from "../validation/user.validation.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await Users.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: true });

    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

// Register User
const registerUser = async (req, res) => {
  // take username, email, password, and avatar
  // validate data
  const validatedData = registerUserSchema.safeParse(req.body);

  if (!validatedData.success) {
    return res.status(403).json({
      success: false,
      message: validatedData.error.errors
        .map((error) => error.message)
        .join(". "),
    });
  }

  const { username, email, password } = validatedData.data;

  // check if user exists or not
  const existingUser = await Users.findOne({ email });

  if (existingUser) {
    return res.status(409).json({
      message: "User with same email address already exists",
    });
  }

  // If user provides a file, upload it to cloudinary
  let userAvatar;
  if (req.file) {
    try {
      userAvatar = await uploadOnCloudinary(req.file.path);

      if (!userAvatar) {
        return res.status(500).json({
          success: false,
          message:
            "Something went wrong while uploading an image on cloudinary",
        });
      }
    } catch (error) {
      return res.status(403).json({
        success: false,
        messsage: "Failed to upload image on cloudinary",
      });
    }
  }

  // create user
  const user = await Users.create({
    username,
    email,
    password,
    avatar: userAvatar
      ? { url: userAvatar.url, public_id: userAvatar.public_id }
      : { url: "", public_id: "" },
  });

  return res.status(200).json({
    success: true,
    message: "Successfuly registered user",
    data: user,
  });
};

const loginUser = async (req, res) => {
  // take email, password
  const validatedData = loginUserSchema.safeParse(req.body);

  if (!validatedData.success) {
    return res.status(500).json({
      success: false,
      message: validatedData.error.errors
        .map((error) => error.message)
        .join(", "),
    });
  }

  const { email, password } = validatedData.data;

  // check if user exists
  const existingUser = await Users.findOne({ email });

  if (!existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "User does not exist" });
  }

  // check if password is correct
  const isPasswordCorrect = await existingUser.comparePasswords(password);

  if (!isPasswordCorrect) {
    return res
      .status(400)
      .json({ success: false, message: "Incorrect Password" });
  }

  // create accesToken and refreshTokens
  // generateAccessAndRefreshToken - generates both tokens and stores the refresh token in db
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existingUser._id
  );

  // get the details of logged in user, except for the password and refreshToken
  const loggedInUser = await Users.findById(existingUser._id).select(
    "-password -refreshToken"
  );

  // Set the tokens as cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("access-token", accessToken, cookieOptions)
    .cookie("refresh-token", refreshToken, cookieOptions)
    .json({
      success: true,
      message: "User logged in successfully",
      data: { user: loggedInUser, accessToken, refreshToken },
    });
};

// logout user
const logoutUser = async (req, res) => {
  // user will give nothing, take user details and delete the cookies?
  const user = await Users.findByIdAndUpdate(
    req.userId,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json({ success: false, message: "User logged out" });
};

// get user
const getUserById = async (req, res) => {
  // get user details by id
  const userId = req.params.userId.trim();

  const user = await Users.findById(userId);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly fetched user details",
    data: user,
  });
};

// user's blogs
const getUserBlogs = async (req, res) => {
  // take userId and get all the blogs that have the userId as authorId
};

// user's read history
const getUserHistory = async (req, res) => {
  // when user clicks on a blog, it is considered as read and the blogId will be added to the history array
};

// change password
const changePassword = async (req, res) => {
  // take old password, check if it meets the current passowrd, change and hash it
};

// update profile picture
const updateUserAvatar = async (req, res) => {
  // take new image and replace it with old image, also delete old image from cloudinary
};

// add to favourite
const addToFavourites = async (req, res) => {
  // clicking bookmark button will take the blog id and add it to the favourites array
};

// get favourites
const getFavourite = async (req, res) => {
  // retreives all the favourite blogs
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserBlogs,
  getUserHistory,
  changePassword,
  updateUserAvatar,
  getUserById,
  addToFavourites,
  getFavourite,
};
