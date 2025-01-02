// Register User
const registerUser = async (req, res) => {
  // take username, image, password, and avatar
  res.send("Hello World");
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
