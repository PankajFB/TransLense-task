const express = require("express");
const cors = require("cors");
const connectToDatabase = require("./config/database");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const cookieParser = require("cookie-parser");
const partnerRoutes = require("./routes/partnerRoutes");
const businessRoutes = require("./routes/businessRoutes");
const fileUpload = require("express-fileupload");
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(cors());

connectToDatabase();

app.use("/api/v1", partnerRoutes);
app.use("/api/v1", businessRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
