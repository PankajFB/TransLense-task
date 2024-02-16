const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BusinessSchema = new Schema(
  {
    businessName: {
      type: String,
      required: false,
    },
    partnerEmail: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    state: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    openingTime: {
      type: String,
      required: false,
    },
    closingTime: {
      type: String,
      required: false,
    },
    businessEmail: {
      type: String,
      required: false,
    },
    businessEmailOtp: {
      type: String,
      required: false,
    },
    businessPhone: {
      type: String,
      required: false,
    },
    businessImageUrl: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", BusinessSchema);
