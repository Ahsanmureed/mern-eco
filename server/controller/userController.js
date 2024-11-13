import userModel from "../models/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errorHandler.js";
import transporter from "../utils/nodeMailer.js";
import logger from '../utils/logger.js'; 

const userRegisterController = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    // Validation
    if (!username) {
      logger.warn("User registration attempt with missing username", { email });
      return next(new AppError("username is required", 400));
    }
    if (!email) {
      logger.warn("User registration attempt with missing email", { username });
      return next(new AppError("Email is required", 400));
    }
    if (!password) {
      logger.warn("User registration attempt with missing password", { username, email });
      return next(new AppError("Password is required", 400));
    }

    // Check username
    const userName = await userModel.findOne({ username });
    if (userName) {
      logger.warn("Username already registered", { username });
      return next(new AppError("username is already registered", 409));
    }

    // Check email
    const user = await userModel.findOne({ email });
    if (user) {
      logger.warn("Email already registered", { email });
      return next(new AppError("email is already registered", 409));
    }

    // Password validation
    const passwordErrors = [];
    if (password.length < 8) {
      passwordErrors.push("Password must be at least 8 characters long");
    }
    if (!/\d/.test(password)) {
      passwordErrors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      passwordErrors.push("Password must contain at least one special character");
    }
    
    // If there are password validation errors, return them
    if (passwordErrors.length > 0) {
      logger.warn("Password validation errors", { errors: passwordErrors });
      return next(new AppError(passwordErrors.join(". "), 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    
    logger.info("User registered successfully", { userId: newUser._id, email });

    return res.status(201).json({
      success: true,
      message: "Signup successfully",
      data: newUser,
    });
  } catch (error) {
    logger.error("Error during user registration", { error });
    return next(new AppError("Internal server error", 500));
  }
};

const userLoginController = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Validation
    if (!email) {
      logger.warn("User login attempt with missing email");
      return next(new AppError("Email is required", 400));
    }
    if (!password) {
      logger.warn("User login attempt with missing password");
      return next(new AppError("Password is required", 400));
    }

    // Check email
    const user = await userModel.findOne({ email });
    if (!user) {
      logger.warn("Incorrect email during login attempt", { email });
      return next(new AppError("The email address you entered doesn’t match any account", 401));
    }

    // Password check
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      logger.warn("Incorrect password during login attempt", { email });
      return next(new AppError("Password is incorrect", 401));
    }

    const accessToken = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "1hr" }
    );
    const { password: pass, ...info } = user._doc;
    
    logger.info("User logged in successfully", { userId: user._id, email });

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      data: info,
      accessToken,
    });
  } catch (error) {
    logger.error("Error during user login", { error });
    return next(new AppError("Internal server error", 500));
  }
};

const userPaginationController = async (req, res, next) => {
  try {
    const {
      limit,
      skip,
      search = "",
      sortBy = "username",
      sortOrder = "asc",
    } = req.query;

    const parsedLimit = limit !== undefined ? Math.min(parseInt(limit), 100) : 10;
    const parsedSkip = skip !== undefined ? parseInt(skip) : 0;

    const searchQuery = search
      ? { username: { $regex: search, $options: "i" } }
      : {};

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    const total = await userModel.countDocuments(searchQuery);
    const data = await userModel
      .find(searchQuery)
      .sort(sortOptions)
      .skip(parsedSkip)
      .limit(parsedLimit);

    logger.info("Fetched users with pagination", { total, limit: parsedLimit, skip: parsedSkip });

    return res.json({ total, limit: parsedLimit, skip: parsedSkip, data });
  } catch (error) {
    logger.error("Error during user pagination", { error });
    return next(new AppError("Internal server error", 500));
  }
};

// Get single user by ID
const singleUserController = async (req, res, next) => {
  try {
    const data = await userModel.findById(req.params.id);
    if (!data) {
      logger.warn("User not found", { userId: req.params.id });
      return next(new AppError("User not found", 404));
    }
    logger.info("Fetched single user", { userId: req.params.id });
    return res.json({ data });
  } catch (error) {
    logger.error("Error fetching single user", { error });
    return next(new AppError("Internal server error", 500));
  }
};

const deleteUserController = async (req, res, next) => {
  try {
    const deleteUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deleteUser) {
      logger.warn("User not found for deletion", { userId: req.params.id });
      return next(new AppError("User not found", 404));
    }
    logger.info("User deleted successfully", { userId: req.params.id });
    return res.json({ message: 'deleted successfully' });
  } catch (error) {
    logger.error("Error deleting user", { error });
    return next(new AppError("Internal server error", 500));
  }
};

const updateUserController = async (req, res, next) => {
  try {
    const updateUser = await userModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updateUser) {
      logger.warn("User not found for update", { userId: req.params.id });
      return next(new AppError("User not found", 404));
    }
    logger.info("User updated successfully", { userId: req.params.id });
    return res.json({ data: updateUser });
  } catch (error) {
    logger.error("Error updating user", { error });
    return next(new AppError("Internal server error", 500));
  }
};

const allUserController = async (req, res, next) => {
  try {
    const data = await userModel.find({});
    logger.info("Fetched all users");
    return res.json({ data });
  } catch (error) {
    logger.error("Error fetching all users", { error });
    return next(new AppError("Internal server error", 500));
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      logger.warn("Password reset attempt with missing email");
      return next(new AppError("Email is required", 400));
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      logger.warn("User not found for password reset", { email });
      return next(new AppError("User not found", 404));
    }
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: '1hr' });
    user.forgotPassword = token;
    user.tokenExpiry = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:5174/reset-password/${token}`;
    const mailOptions = {
      from: 'ach162753@gmail.com',
      to: user.email,
      subject: 'Password Reset Request',
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n`,
    };

    await transporter.sendMail(mailOptions);
    logger.info("Password reset email sent", { email });

    return res.json({ message: "Email has been sent to your Gmail" });
  } catch (error) {
    logger.error("Error during password reset", { error });
    return next(new AppError("Internal server error", 500));
  }
};
const fetchUserController = async(req,res)=>{
  try {
   const user = await userModel.findById(req.userId).select('-password');
   if (!user) {
     return res.status(404).json({ message: 'User not found' });
     logger.warn('User not found');
   }

       res.json({data:user});
  } catch (error) {
   logger.error("Error during fetching user", { error });
   return next(new AppError("Internal server error", 500));
  }

}
export { 
  userLoginController, 
  userRegisterController, 
  singleUserController, 
  updateUserController, 
  allUserController, 
  deleteUserController, 
  userPaginationController, 
  forgotPassword ,
  fetchUserController
};
