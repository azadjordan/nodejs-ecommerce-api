

// getTokenFromHeader.js
export const getTokenFromHeader = (req) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  if (token === undefined) {
    throw new Error("No token found in the header");
  } else {
    return token;
  }
};

