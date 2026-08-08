const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  bio: {
    type: String,
    default: "",
    maxlength: 300,
  },
  location: {
    type: String,
    default: "",
    maxlength: 100,
  },
  website: {
    type: String,
    default: "",
    maxlength: 200,
  },
  repositories: [
    {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: [],
    },
  ],
  followedUsers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  starRepos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: [],
    },
  ],
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

module.exports = User;
