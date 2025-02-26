import { Users } from "../models/user.model.js";
import {
  registerUserSchema,
  loginUserSchema,
  changePasswordSchema,
} from "../validation/user.validation.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

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
        console.log("Did not upload file on cloudinary");

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

const refreshToken = async (req, res) => {
  // take the current refresh token from cookies or body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res
      .status(401)
      .json({ success: false, message: "Refresh token is required" });
  }
  // get user from the id
  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await Users.findById(decodedToken._id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // check if the refresh token is the same as the one in the db
    if (incomingRefreshToken !== user.refreshToken) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid refresh Token" });
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        sucess: true,
        message: "Access token refreshed",
        data: { accessToken, refreshToken: newRefreshToken },
      });
  } catch (error) {
    // Handle token verification errors specifically
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token expired" });
    }

    return res.status(401).json({
      success: false,
      message: error.message || "Invalid refresh token",
    });
  }
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

const getUserHistory = async (req, res) => {
  // when user clicks on a blog, it is considered as read and the blogId will be added to the history array
  const user = await Users.findById(req.userId);

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (user.history.length < 1) {
    return res.status(200).json({
      success: true,
      message: "User has not read any blogs",
      data: [],
    });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly fetched user reading history",
    data: user.history,
  });
};

// change password
const changePassword = async (req, res) => {
  // take old password, check if it meets the current passowrd, change and hash it
  const validatedData = changePasswordSchema.safeParse(req.body);

  if (!validatedData.success) {
    return res.status(400).json({
      success: false,
      message: validatedData.error.errors
        .map((error) => error.message)
        .join(". "),
    });
  }

  const { oldPassword, newPassword } = validatedData.data;

  const user = await Users.findById(req.userId);

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  const isOldPasswordCorrect = await user.comparePasswords(oldPassword);

  if (!isOldPasswordCorrect) {
    return res.status(400).json({
      success: false,
      message: "Old password is incorrect",
    });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  const updatedUser = await Users.findById(req.userId).select(
    "-password -refreshToken"
  );

  return res.status(200).json({
    success: true,
    message: "Successfuly updated user's password",
    data: updatedUser,
  });
};

// update profile picture
const updateUserAvatar = async (req, res) => {
  console.log("Update user avatar was called");
  // take new image and replace it with old image, also delete old image from cloudinary
  const user = await Users.findById(req.userId).select(
    "-password -refreshToken"
  );

  const oldAvatar = user.avatar;

  if (oldAvatar.public_id) {
    console.log(oldAvatar.public_id);
    const deleteOldAvatar = await deleteFromCloudinary(oldAvatar.public_id);
    console.log(deleteOldAvatar);
  } else {
    console.log("There was no image to be deleted to begin with");
  }

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  if (!req.file) {
    return res
      .status(404)
      .json({ success: false, message: "Avatar is required" });
  }

  let newAvatar = req.file;

  newAvatar = await uploadOnCloudinary(newAvatar.path);

  if (!newAvatar) {
    return res.status(400).json({
      success: false,
      message: "Something went wrong while updating the user avatar",
    });
  }

  user.avatar = {
    url: newAvatar.url,
    public_id: newAvatar.public_id,
  };

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Successfuly updated user avatar",
    data: user,
  });
};

const getFavourites = async (req, res) => {
  // retreives all the favourite blogs
  const user = await Users.findById(req.userId);

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  if (user.favourite.length < 1) {
    return res.status(200).json({
      success: true,
      messsage: "User has no favourite blog",
      data: [],
    });
  }

  return res.status(200).json({
    success: true,
    message: "Successfully fetched all favourite blog of the user",
    data: data.favourite,
  });
};

// add to favourite
const addToFavourites = async (req, res) => {
  // clicking bookmark button will take the blog id and add it to the favourites array
  const blogId = req.params.blogId;

  const user = await Users.findById(req.user);

  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  user.favourite.push(blogId);
  await user.save();

  return res.status(200).json({
    success: true,
    message: "Successfuly added the blog to favourites",
    data: user.favourite,
  });
};

// delete user
const deleteUser = async (req, res) => {
  const user = await Users.findOneAndDelete({ _id: req.userId });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while deleting the user",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Successfuly deleted the user",
    data: null,
  });
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUserHistory,
  changePassword,
  updateUserAvatar,
  getUserById,
  addToFavourites,
  getFavourites,
  deleteUser,
};
