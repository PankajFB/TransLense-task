const jwt = require("jsonwebtoken");


const sendPartnerToken = (partner, statusCode, res) => {
  // Create jwt token
  const token = partner.getJwtToken();
  // Options for cookie
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  partner.password = undefined; 


  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    partner,
    token,
  });
};

module.exports = { sendPartnerToken };

