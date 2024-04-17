import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import connectDB from "./config/database.js";
import userRoutes from "./routes/user.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import imagekit from "./utils/imageKit.js";
import cors from "cors";

dotenv.config();
const app = express();
const port = process.env.PORT || 4000;

// Middleware to parse json data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// adding cookieParser
app.use(cookieParser());
app.use(cors());

// database connect
connectDB();

app.get("/api/v1", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backed API Server Is Running",
  });
});

app.get("/api/v1/imagekit-Auth", function (req, res) {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

// mount the userRoutes
app.use("/api/v1", userRoutes);
// mount the blogRoutes
app.use("/api/v1", blogRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Hello World",
    success: true,
  });
});

app.listen(port, () => {
  console.log(`Your Server is Running On  Port`, port);
});
