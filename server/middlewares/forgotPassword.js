import userModel from "../models/userSchema.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AppError } from "../utils/errorHandler.js"; 
import logger from "../utils/logger.js";
import customerModel from "../models/customerSchema.js";


const forgotPasswordUser = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    logger.warn("Password is required", { token });
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    logger.info("Token verified successfully", { userId: decoded.id });

    const user = await userModel.findById(decoded.id);
    if (!user || !user.forgotPassword || user.forgotPassword !== token) {
      logger.warn("Token already used or invalid", { token });
      return res.status(403).json({ message: 'Invalid or expired reset link. Please request a new one.' });
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

    // Hash the new password
    user.password = await bcrypt.hash(password, 10);
    user.forgotPassword = undefined; 
    user.tokenExpiry = undefined; 

    await user.save();
    logger.info("Password has been reset successfully", { userId: user._id });

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle token errors
      if (error.message === 'jwt expired') {
        logger.warn("Token has expired", { token });
        return res.status(401).json({ message: 'Link has expired please use new one' });
      }
      logger.warn("Invalid token", { token });
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Handle other potential errors
    logger.error("An error occurred during password reset", { error });
    res.status(500).json({ message: 'An error occurred during password reset' });
  }
};
const jwtChecker = async (req, res, next) => {
  const { token } = req.params;

  jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
    if (err) {
      logger.warn("Invalid token", { error: err.message, token });
      return res.status(403).json({ message: 'Invalid token' });
    }
    
     
    // Check if the token has already been used
    const user = await customerModel.findById(data.id);
    if (!user || !user.forgotPassword || user.forgotPassword !== token) {
      logger.warn("Token already used or invalid", { token });
      return res.status(403).json({ message: 'Invalid or already used token' });
    }

    req.userId = data._id;
    logger.info("Token verified successfully", { userId: req.userId });
    next();
  });
};

const forgotPasswordCustomer = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    logger.warn("Password is required", { token });
    return res.status(400).json({ message: 'Password is required' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    logger.info("Token verified successfully", { userId: decoded.id });

    const customer = await customerModel.findById(decoded.id);
    if (!customer) {
      logger.warn("User not found for the given token", { token });
      return res.status(400).json({ message: 'Invalid token' });
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

    // Hash the new password
    customer.password = await bcrypt.hash(password, 10);
    customer.forgotPassword = undefined; 
    customer.tokenExpiry = undefined; 

    await customer.save();
    logger.info("Password has been reset successfully", { customerId: customer._id });

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Handle token errors
      if (error.message === 'jwt expired') {
        logger.warn("Token has expired", { token });
        return res.status(401).json({ message: 'Link has expired please use new one' });
      }
      logger.warn("Invalid token", { token });
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Handle other potential errors
    logger.error("An error occurred during password reset", { error });
    res.status(500).json({ message: 'An error occurred during password reset' });
  }
};

export {forgotPasswordCustomer,forgotPasswordUser,jwtChecker};
