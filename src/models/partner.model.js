const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;
const jwt = require("jsonwebtoken");


const Schema = mongoose.Schema;

const PartnerSchema = new Schema(
  {
    fullName: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    emailOtp: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    phoneOtp: {
      type: String,
      required: false,
    },
    profilePicUrl: {
      type: String,
      required: false,
    },
    businessInfo: {
      type: Schema.Types.ObjectId,
      ref: "Business",
    },
    role: {
      type: String,
      default: "partner",
    },
  },
  { timestamps: true }
);

// Hash the password before saving
PartnerSchema.pre("save", function (next) {
  const user = this;

  // Only hash the password if it's been modified or is new
  if (!user.isModified("password")) return next();

  // Generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    // Hash the password with the new salt
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) return next(err);

      // Override the plain text password with the hashed one
      user.password = hash;
      next();
    });
  });
});

// Method to compare a password
PartnerSchema.methods.comparePassword = function (userPassword, callback) {
  const hashedPassword = String(this.password); // Ensure this.password is a string
  const providedPassword = String(userPassword); // Ensure userPassword is a string

  return bcrypt.compare(providedPassword, hashedPassword);
};

PartnerSchema.methods.getJwtToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    }
  );
};

module.exports = mongoose.model("Partner", PartnerSchema);
