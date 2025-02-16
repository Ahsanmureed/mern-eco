import customerModel from "../models/customerSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/errorHandler.js";
import transporter from "../utils/nodeMailer.js";
import logger from '../utils/logger.js'; 
const customerRegisterController = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
   
    
    if (!username) {
      logger.warn("Registration attempt without username");
      return next(new AppError("username is required", 400));
    }
    if (!email) {
      logger.warn("Registration attempt without email");
      return next(new AppError("Email is required", 400));
    }
    if (!password) {
      logger.warn("Registration attempt without password");
      return next(new AppError("Password is required", 400));
    }
    
    // Check username
    const userName = await customerModel.findOne({ username });
    if (userName) {
      logger.warn("Username already registered", { username });
      return next(new AppError("username must be unique", 409));
    }
    
    // Check email
    const user = await customerModel.findOne({ email });
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
    if (passwordErrors.length > 0) {
      logger.warn("Password validation failed: " + passwordErrors.join(", "));
      return next(new AppError(passwordErrors.join(". "), 400));
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new customerModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    logger.info("User registered successfully", { userId: newUser._id });
    
    return res.status(201).json({
      success: true,
      message: "Signup successfully",
      data: newUser,
    });
  } catch (error) {
    logger.error("Error during user registration", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};

const customerLoginController = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email) {
      logger.warn("Login attempt without email");
      return next(new AppError("Email is required", 400));
    }
    if (!password) {
      logger.warn("Login attempt without password");
      return next(new AppError("Password is required", 400));
    }
    
    const customer = await customerModel.findOne({ email });
    if (!customer) {
      logger.warn("Login attempt with incorrect email", { email });
      return next(new AppError("The email address you entered doesn’t match any account", 401));
    }
    
    const checkPassword = await bcrypt.compare(password, customer.password);
    if (!checkPassword) {
      logger.warn("Login attempt with incorrect password", { email });
      return next(new AppError("Password is incorrect", 401));
    }
    
    const accessToken = jwt.sign(
      { _id: customer._id, email: customer.email },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );
    const { password: pass, ...info } = customer._doc;
    logger.info("User logged in successfully", { email,password });
    
    return res.status(200).json({
      success: true,
      message: "Login successfully",
      data: info,
      accessToken,
    });
  } catch (error) {
    logger.error("Error during user login", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};

const customerPaginationController = async (req, res, next) => {
  try {
    const { limit, skip, search = "", sortBy = "username", sortOrder = "asc" } = req.query;

    const parsedLimit = limit !== undefined ? Math.min(parseInt(limit), 100) : 10;
    const parsedSkip = skip !== undefined ? parseInt(skip) : 0;
    const searchQuery = search ? { username: { $regex: search, $options: "i" } } : {};

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const total = await customerModel.countDocuments(searchQuery);
    const data = await customerModel.find(searchQuery).sort(sortOptions).skip(parsedSkip).limit(parsedLimit);

    logger.info("Fetched customers with pagination", { total, limit: parsedLimit, skip: parsedSkip });

    return res.json({ total, limit: parsedLimit, skip: parsedSkip, data });
  } catch (error) {
    logger.error("Error during customer pagination", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};

const singleCustomerController = async (req, res, next) => {
  try {
    const data = await customerModel.findById(req.params.id);
    if (!data) {
      logger.warn("Customer not found", { customerId: req.params.id });
      return next(new AppError("Customer not found", 404));
    }
    logger.info("Fetched single customer", { customerId: req.params.id });
    return res.json({ data });
  } catch (error) {
    logger.error("Error fetching single customer", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};

const deleteCustomerController = async (req, res, next) => {
  try {
    const deleteUser = await customerModel.findByIdAndDelete(req.params.id);
    if (!deleteUser) {
      logger.warn("Customer not found for deletion", { customerId: req.params.id });
      return next(new AppError("Customer not found", 404));
    }
    logger.info("Customer deleted successfully", { customerId: req.params.id });
    return res.json({ message: 'Deleted successfully' });
  } catch (error) {
    logger.error("Error deleting customer", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};

const updateCustomerController = async (req, res, next) => {
  const {address} =req.body;
  
  const {street,city,zip,state,country,phone_number}=address
  console.log(street);

  if(!street){
    logger.warn("Street is required");
    return next(new AppError("Street is required", 404));
  }
  if(!state){
    logger.warn("State is required",
    );
    return next(new AppError("State is required", 404));
  }
  if(!zip){
    logger.warn("Zip Code is required",
    );
    return next(new AppError("Zip Code is required", 404));
  }
  if(!city){
    logger.warn("City is required",);
    return next(new AppError("City is required", 404));
  }
  if(!country){
    logger.warn("Country is required" );
    return next(new AppError("Country is required", 404));
  }
  if(!phone_number){
    logger.warn("Phone Number is required",
    );
    return next(new AppError("Phone Number is required", 404));
  }
  try {
    const updateUser = await customerModel.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updateUser) {
      logger.warn("Customer not found for update", { customerId: req.params.id });
      return next(new AppError("Customer not found", 404));
    }
    logger.info("Customer updated successfully", { customerId: req.params.id });
    return res.json({ data: updateUser });
  } catch (error) {
    logger.error("Error updating customer", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};

const allCustomerController = async (req, res, next) => {
  try {
    const data = await customerModel.find({});
    logger.info("Fetched all customers");
    return res.json({ data });
  } catch (error) {
    logger.error("Error fetching all customers", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};

const customerForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  try {
    if (!email) {
      logger.warn("Password reset attempt without email");
      return next(new AppError("Email is required", 400));
    }
    
    const customer = await customerModel.findOne({ email });
    if (!customer) {
      logger.warn("Password reset attempt for non-existent email", { email });
      return next(new AppError("User not found", 404));
    }
    
    const token = jwt.sign({ id: customer._id }, process.env.SECRET_KEY, { expiresIn: '1hr' });
    customer.forgotPassword = token;
    customer.tokenExpiry = Date.now() + 3600000;
    await customer.save();
    
    const resetUrl = `http://localhost:5173/reset-password/${token}`;
    const mailOptions = {
      from: 'ach162753@gmail.com',
      to: customer.email,
      subject: 'Password Reset Request',
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.\n`,
    };
    
    await transporter.sendMail(mailOptions);
    logger.info("Password reset email sent", { email });
    
    return res.json({ message: "Reset link sent! Check your inbox" });
  } catch (error) {
    logger.error("Error during password reset process", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
  }
};
const fetchCustomerController = async(req,res)=>{
   try {
    const customer = await customerModel.findById(req.user._id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'User not found' });
      logger.warn('User not found');
    }

        res.json({data:customer});
   } catch (error) {
    logger.error("Error during fetching user", { error });
    return next(new AppError("Something went wrong, please try again later", 500));
   }

}

export {
  customerLoginController,
  customerRegisterController,
  singleCustomerController,
  updateCustomerController,
  allCustomerController,
  deleteCustomerController,
  customerPaginationController,
  customerForgotPassword,
  fetchCustomerController
};
