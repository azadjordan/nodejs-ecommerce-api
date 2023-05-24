import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyToken } from "../utils/verifyToken.js";

export const isLoggedIn = (req, res, next) => {
  // get token from header
  const token = getTokenFromHeader(req);
  // verify the token
  const decodedUser = verifyToken(token);

  if (!decodedUser) {
    throw new Error("Invalid/Expired token, please login again");
  } else {
    // save the user into the req obj
    req.userAuthId = decodedUser?.id;
    next();
  }
};

///////////// But why we're using getTokenFromHeader  and verifyToken again? we already used them inside isLoggedIn!

// You're correct that getTokenFromHeader and verifyToken are also used inside
// isLoggedIn middleware. However, getUserProfileController needs
// to verify the token again to ensure that the user is authenticated
// and authorized to access their profile information.

// Even though the user has already been authenticated by isLoggedIn middleware
// and their decoded user object has been saved in the request object,
// getUserProfileController needs to verify the token again to ensure
// that the user has not logged out or their token has not been revoked since their last request.

// By re-verifying the token, getUserProfileController can ensure that the request
// is still coming from an authenticated and authorized user.
