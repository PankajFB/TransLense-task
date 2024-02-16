const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Partners = require("../models/partner.model.js");
const nodemailer = require("nodemailer");
const sendToken = require("../utils/sendToken.js");
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

exports.signUp = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: false,
        message: "Please enter email and password",
      });
    }

    const isPartner = await Partners.findOne({ email: email });

    if (isPartner) {
      return res.status(400).json({
        status: false,
        message: "Partner already exists",
      });
    }

    const partner = await Partners.create({
      email,
      password,
    });

    res.status(201).json({
      message: "Successfully Registered",
      partner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

exports.login = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: false,
        message: "Please enter email and password",
      });
    }

    const partner = await Partners.findOne({ email: email }).select(
      "+password"
    );

    console.log(password, partner.password);

    // if email is not found
    if (!partner) {
      return res.status(401).json({
        status: false,
        message: "Email not registered",
      });
    }

    // check if password is correct
    const isPasswordMatched = await partner.comparePassword(password);

    if (!isPasswordMatched) {
      return res.status(401).json({
        status: false,
        message: "Invalid email or password",
      });
    }

    sendToken.sendPartnerToken(partner, 200, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

exports.updatePartnerDetails = catchAsyncErrors(async (req, res, next) => {
  try {
    const { fullName, state, city, country, address, email } = req.body;

    const isPartner = await Partners.findOne({ email: email });

    if (!isPartner) {
      res.status(400).json({
        status: false,
        message: "Partner not found",
      });
    }

    const updatedData = await Partners.findOneAndUpdate(
      { email: email },
      {
        fullName,
        state,
        city,
        country,
        address,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedData) {
      res.status(201).json({
        message: "Cannot not update data",
      });
    }

    res.status(201).json({
      message: "Profile Updated Successfully",
      updatedData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// funtion to make a otp
function generateToken(length) {
  const digits = "0123456789";
  let token = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    token += digits[randomIndex];
  }

  return token;
}

// to send the email otp
exports.sendEmailOtp = catchAsyncErrors(async (req, res) => {
  try {
    console.log(req.user);
    const { email } = req.body;

    const { email: prevEmail } = req.user;

    // Generate a otp
    const otp = generateToken(6);

    const partner = await Partners.findOne({ email: prevEmail });

    if (!partner) {
      res.status(400).json({
        status: false,
        message: "Partner does not exist",
      });
    }

    // save the otp in the database
    partner.emailOtp = otp;

    await partner.save();

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
      to: email,
      subject: "Email Verification",
      text: `Use this otp to verify your email address: ${otp}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Email verification otp sent successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending email verification otp",
      error: error.message,
    });
  }
});

// verify the email otp
exports.verifyEmailOtp = catchAsyncErrors(async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { email: prevEmail } = req.user;

    const partner = await Partners.findOne({ email: prevEmail });

    if (!partner) {
      res.status(400).json({
        status: false,
        message: "Partner does not exist",
      });
    }

    if (partner.emailOtp !== otp) {
      return res.status(400).json({
        status: false,
        message: "Invalid otp",
      });
    }

    partner.email = email;

    partner.emailOtp = "";

    await partner.save();

    res.status(200).json({
      success: true,
      message: "Email updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying email otp",
      error: error.message,
    });
  }
});

// upload profile prcture
exports.uploadProfilePicture = catchAsyncErrors(async (req, res) => {
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

      const response = await uploadFileToCloudinary(file, "ProfilePictures");
      image = response.secure_url;
      console.log(image);
    } else {
      console.log(image);
      return res.status(400).json({
        message: "Please upload an image",
      });
    }

    const partner = await Partners.findOneAndUpdate(
      { email },
      { profilePicUrl: image },
      {
        new: true,
      }
    );

    if (!partner) {
      return res.status(400).json({
        message: "Cannot not update the partner with the profile picture",
      });
    }

    res.status(201).json({
      message: "Profile picture updated successfully",
      partner,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});
