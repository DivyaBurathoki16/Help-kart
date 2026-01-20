import jwt from 'jsonwebtoken';

const generateToken = (userId) => {
<<<<<<< HEAD
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables. Please set it in your .env file.');
  }
  
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

export default generateToken;
