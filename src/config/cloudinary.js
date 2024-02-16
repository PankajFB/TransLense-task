const cloudinary = require("cloudinary").v2;
const dotenv = require("dotenv");
dotenv.config();

const cloudinaryConnect = async () => {
  
  try {
     cloudinary.config({
      cloud_name: "dsqrxibya",
      api_key: "626913413919669",
      api_secret: "Pj8elIsbB5IiL-eVb_M6Qx7FV9U",
    });
  } catch (err) {
    console.log(err);
    console.error(err);
  }
};

module.exports = cloudinaryConnect;
