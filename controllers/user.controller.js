import { Users } from "../models/user.model.js";
import { userSchema } from "../validation/user.validation.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await Users.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

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
  const validatedData = userSchema.safeParse(req.body);

  if (!validatedData.success) {
    return res.status(403).json({
      success: false,
      message: validatedData.error,
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

// Login user
const loginUser = async (req, res) => {
  // take email, password
};

// logout user
const logoutUser = async (req, res) => {
  // user will give nothing, take user details and delete the cookies?
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

// get user
const getUserById = async (req, res) => {
  // get user details by id
};

// add to favourite
const addToFavourites = async (req, res) => {
  // clicking bookmark button will take the blog id and add it to the favourites array
};

// get favourites
const getFavourite = async (req, res) => {
  // retreives all the favourite blogs
};

export { registerUser };
