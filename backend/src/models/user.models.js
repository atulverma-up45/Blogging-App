import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = mongoose.Schema(
  {
    personal_info: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        minlength: [3, "Username must be 3 letters long"],
        unique: true,
        sparse: true,
      },
      bio: {
        type: String,
        maxlength: [200, "Bio should not be more than 200"],
        default: "",
      },
      avatar: {
        type: String,
        required: true,
      },
      contactNumber: {
        type: Number,
        default: ""
      },
    },
    social_links: {
      youtube: {
        type: String,
        default: "",
      },
      instagram: {
        type: String,
        default: "",
      },
      facebook: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },
    account_info: {
      total_posts: {
        type: Number,
        default: 0,
      },
      total_reads: {
        type: Number,
        default: 0,
      },
    },
    google_auth: {
      type: Boolean,
      default: false,
    },
    blogs: {
      type: [Schema.Types.ObjectId],
      ref: "Blogs",
      default: [],
    },
    refreshToken: {
      type: String,
    },
    accountType: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
  },

  {
    timestamps: {
      createdAt: "joinedAt",
    },
  }
);

// Pre-save hook for hashing the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("personal_info.password")) {
    return next();
  }
  // Generate a salt
  const salt = await bcrypt.genSalt(10);

  // Hash the password along with the new salt
  const hashedPassword = await bcrypt.hash(this.personal_info.password, salt);
  this.personal_info.password = hashedPassword;
  next();
});

// Pre-update hook for hashing the updated password
userSchema.pre("findOneAndUpdate", async function (next) {
  if (this._update["personal_info.password"]) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(
      this._update["personal_info.password"],
      salt
    );
    this._update["personal_info.password"] = hashedPassword;
  }
  next();
});

// Method to check if a password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.personal_info.password);
};

// method for Generating the accessToken
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

// method for Generating the Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export default mongoose.model("users", userSchema);
