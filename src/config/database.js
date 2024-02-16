// config/database.js
const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.Database_URI);
    console.log(`Connected to the database successfully.`);
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  }
};

module.exports = connectToDatabase;
