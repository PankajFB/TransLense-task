const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth.js");

const router = express.Router();
const {
  signUp,
  login,
  updatePartnerDetails,
  sendEmailOtp,
  verifyEmailOtp,
  uploadProfilePicture
} = require("../controllers/partnerController");

router.post("/signup", signUp);
router.post("/login", login);
router.put("/updateDetails", isAuthenticatedUser, updatePartnerDetails);
router.post("/sendEmailOtp", isAuthenticatedUser, sendEmailOtp);
router.post("/verifyEmailOtp", isAuthenticatedUser, verifyEmailOtp);
router.post("/uploadProfilePicture", isAuthenticatedUser, uploadProfilePicture);



module.exports = router;
