// import Jwt from "jsonwebtoken";

// export const verifyToken = (token) => {
//   return Jwt.verify(token, process.env.SECRET, (err, decoded) => {
//     if (err) {
//       return false;
//     } else {
//       return decoded;
//     }
//   });
// };

// verifyToken.js
import Jwt from "jsonwebtoken";

export const verifyToken = (token) => {
  try {
    const decoded = Jwt.verify(token, process.env.SECRET);
    return decoded;
  } catch (err) {
    return false;
  }
};
