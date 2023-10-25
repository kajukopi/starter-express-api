const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with environment variables
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Restore newline characters
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

// OAuth2 credentials
const CLIENT_ID = "553140362873-vit7qbcs4areqigcq73p92omii722uj5.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "http://localhost:3000/auth/google/callback";
const REFRESH_TOKEN = "1//0g3UejkXIR7SjCgYIARAAGBASNwF-L9Ir6s3ctToOO_8tBlBvB0slry9X4rMnOoIvPWxw9jWB6C9V2N__uFNCK6hE5xO0-hHuYGQ";

const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Set up OAuth2 credentials with the refresh token
oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "klinikburuh@gmail.com", // Your Gmail email address
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken: REFRESH_TOKEN,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.get("/", async (req, res) => {
  try {
    res.json({ status: true });
  } catch (error) {
    res.json({ status: false });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    const actionCodeSettings = {
      url: req.headers.referer, // The URL where users will be redirected after verifying their email
      handleCodeInApp: true, // This is required to handle the link in your app
    };
    admin
      .auth()
      .generateEmailVerificationLink(email, actionCodeSettings)
      .then((link) => {
        console.log("Email verification link:", link);
        const mailOptions = {
          from: "klinikburuh@gmail.com",
          to: email, // Recipient's email address
          subject: "Hello from Gmail and Nodemailer",
          text: link,
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error("Error sending email:", error);
            res.json({ status: false, error });
          } else {
            console.log("Email sent:", info.response);
            res.json({ status: true });
          }
        });
      })
      .catch((error) => {
        console.error("Error generating email verification link:", error);
        res.json({ status: false, error });
      });
  } catch (error) {
    res.json({ status: false });
  }
});

router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    res.json({ status: true });
  } catch (error) {
    res.json({ status: false });
  }
});

router.post("/signout", async (req, res) => {
  try {
    res.json({ status: true });
  } catch (error) {
    res.json({ status: false });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    res.json({ status: true });
  } catch (error) {
    res.json({ status: false });
  }
});

router.put("/:id", async (req, res) => {
  try {
    res.json({ status: true });
  } catch (error) {
    res.json({ status: false });
  }
});

module.exports = router;

// const authUrl = oauth2Client.generateAuthUrl({
//   access_type: "offline", // Request a refresh token
//   scope: ["https://mail.google.com/"], // Adjust the scope as needed
// });
// console.log("Authorize this app by visiting this URL:", authUrl);

// const authorizationCode = "4/0AfJohXkU3C-UzEAQLh_EmXVALNSFRWaiQbCt1rOqg-uoTabEWEKkuza5jJOo9OMd00fvQg";
// oauth2Client.getToken(authorizationCode, (err, tokens) => {
//   if (err) {
//     console.error("Error exchanging code for tokens:", err);
//     return;
//   }
//   const access_token = tokens.access_token;
//   const refresh_token = tokens.refresh_token;
//   // Store the refresh_token securely for future use
//   console.log("Access Token:", access_token);
//   console.log("Refresh Token:", refresh_token);
// });
