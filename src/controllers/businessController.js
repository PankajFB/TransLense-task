const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Partners = require("../models/partner.model.js");
const nodemailer = require("nodemailer");
const Business = require("../models/business.model.js");
const cloudinaryConnect = require("../config/cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinaryConnect();
function isFileTypeSupported(type, supportedType) {
  return supportedType.includes(type);
}

async function uploadFileToCloudinary(file, folder) {
  const options = { folder };
  options.resource_type = "auto";
  return await cloudinary.uploader.upload(file.tempFilePath, options);
}

exports.updateBusiness = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email } = req.user;
    const {
      businessName,
      businessEmail,
      country,
      state,
      city,
      address,
      openingTime,
      closingTime,
    } = req.body;

    if (
      !businessName ||
      !country ||
      !state ||
      !city ||
      !address ||
      !openingTime ||
      !closingTime
    ) {
      res.status(400).json({
        status: false,
        message: "Please enter all the fields",
      });
    }

    const business = await Business.findOneAndUpdate(
      { partnerEmail: email },
      {
        businessName,
        businessEmail,
        country,
        state,
        city,
        address,
        openingTime,
        closingTime,
      },
      {
        new: true,
      }
    );

    if (!business) {
      const newBusiness = await Business.create({
        businessName,
        partnerEmail: email,
        businessEmail,
        country,
        state,
        city,
        address,
        openingTime,
        closingTime,
      });

      // update the reference to the business in the partner model
      const partner = await Partners.findOneAndUpdate(
        { email },
        { partnerEmail: email, businessInfo: newBusiness._id },
        {
          new: true,
        }
      );

      if (!partner) {
        return res.status(400).json({
          message: "Cannot not update the partner with the business info",
          business: newBusiness,
        });
      }

      return res.status(201).json({
        message: "Business created successfully",
        business: newBusiness,
      });
    }

    res.status(200).json({
      message: "Business updated successfully",
      business,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

function generateToken(length) {
  const digits = "0123456789";
  let token = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    token += digits[randomIndex];
  }

  return token;
}

// send otp on email address
exports.sendOtp = catchAsyncErrors(async (req, res, next) => {
  try {
    const {email} =  req.user
    const { email : newEmail } = req.body;

    const business = await Business.findOne({ businessEmail: email });

    if (!business) {
      return res.status(404).json({
        status: false,
        message: "Business not found",
      });
    }

    // Generate a otp
    const otp = generateToken(6);

    // Send a otp to the email address
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: newEmail,
      subject: "Email Verification",
      text: `Use this otp to verify your email address: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    business.businessEmailOtp = otp;

    await business.save();

    res.status(200).json({
      success: true,
      message: "Otp sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// upload profile prcture
exports.uploadBusinessPicture = catchAsyncErrors(async (req, res) => {
  try {
    const { email } = req.user;

    let image;

    if (req.files && req.files.image) {
      const file = req.files.image;

      const supportedTypes = ["jpg", "jpeg", "png", "webp"];
      const fileType = file.name.split(".").pop().toLowerCase();

      if (!isFileTypeSupported(fileType, supportedTypes)) {
        return res.status(400).json({
          success: false,
          message: "File format is not supported",
        });
      }

      const response = await uploadFileToCloudinary(file, "BusinessPictures");
      image = response.secure_url;
      console.log(image);
    } else {
      console.log(image);
      return res.status(400).json({
        message: "Please upload an image",
      });
    }

    const business = await Business.findOneAndUpdate(
      { partnerEmail :email },
      { businessImageUrl: image },
      {
        new: true,
      }
    );

    if (!business) {
      return res.status(400).json({
        message: "Cannot not update the business picture",
      });
    }

    res.status(201).json({
      message: "Business Profile updated successfully",
      business,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
