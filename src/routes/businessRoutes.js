const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth.js");


const router = express.Router();
const {
  updateBusiness,
  sendOtp,
  uploadBusinessPicture
} = require("../controllers/businessController");

router.post("/updateBusiness",isAuthenticatedUser, updateBusiness);
router.post("/sendOtpBusiness",isAuthenticatedUser, sendOtp);
router.post("/uploadBusinessPicture",isAuthenticatedUser, uploadBusinessPicture);

// business routes

module.exports = router;
