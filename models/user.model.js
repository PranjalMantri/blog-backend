import { compare, genSalt, hash } from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  timestamps: true,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified(this.password)) return next();

  try {
    const salts = await genSalt(10);
    this.password = await hash(this.password, salts);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePasswords = async function (password) {
  return await compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);
