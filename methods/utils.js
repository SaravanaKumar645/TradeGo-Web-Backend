const jwt = require("jsonwebtoken");
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobileNumber,
    },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "20d",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobileNumber,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "30d",
    }
  );
};
const authorizeToken = async (req, res, token) => {
  // const authHeader = req.headers.authorization;
  if (token) {
    // const token = authHeader.split(" ")[1];
    //const token = cookie;
    jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send({ msg: "Token is not valid!" });
      }
      req.user = user;
      return true;
    });
  } else {
    res.status(401).send({ msg: "You are not authenticated!" });
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  authorizeToken,
};
