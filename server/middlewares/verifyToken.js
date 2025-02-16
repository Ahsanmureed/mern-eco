import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  

  if (!authHeader) {
    logger.warn("Authorization header is missing", { ip: req.ip });
    return res.status(401).json({ message: 'Unauthorized person' });
  }

  const token = authHeader.split(' ')[1];



  jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
    if (err) {
      logger.warn("Token verification failed", { error: err.message, token });
      return res.status(403).json({ message: 'Unauthorized person' });
    }

    req.user = data;
    logger.info("Token verified successfully", { user: req.user });

    next();
  });
};

const authorizeSalesman = (req, res, next) => {
  if (req.user.role === 'salesman') {
      return next();
  }
  return res.status(403).send({ error: 'Access denied.' });
};
export  {verifyToken,authorizeSalesman};
