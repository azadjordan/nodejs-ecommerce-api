import dotenv from "dotenv";
dotenv.config();

// verifyToken.js
import Jwt from "jsonwebtoken";

export const verifyToken = (token) => {
  try {
    const decoded = Jwt.verify(token, process.env.JWT_KEY);
    return decoded;
  } catch (err) {
    return false;
  }
};
