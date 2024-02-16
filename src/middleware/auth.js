const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const partner = require("../models/partner.model");


//check if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    // return next(new ErrorHandler("Login first to access this resource", 401));
    return res.status(401).json({
      message: "Login first to access this resource"
    })
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await partner.findById(decodedData.id);
  console.log("calling next")
  next();
});
