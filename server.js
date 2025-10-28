// server.js
import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import cors from "cors";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import * as constants from "./utils/constant.js";
import axios from "axios";
import md5 from "md5";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

let otpStore = {};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateEmailHTML = (otp) => {
  const otpDigits = otp.split("").join(" ");

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
        rel="stylesheet"
      />
      <title>Verification Code</title>
      <style type="text/css">
          body {
              margin: 0;
              padding: 0;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
          }
          
          table {
              border-collapse: collapse;
              mso-table-lspace: 0pt;
              mso-table-rspace: 0pt;
          }
          
          img {
              border: 0;
              height: auto;
              line-height: 100%;
              outline: none;
              text-decoration: none;
              -ms-interpolation-mode: bicubic;
          }
          
          @media only screen and (max-width: 620px) {
              .main-container {
                  width: 100% !important;
                  max-width: 100% !important;
              }
              
              .inner-content {
                  padding: 25px 20px !important;
              }
              
              .verification-code {
                  font-size: 28px !important;
                  letter-spacing: 4px !important;
              }
              
              .code-container {
                  padding: 20px 10px !important;
              }
              
              .body-text {
                  font-size: 13px !important;
              }
              
              .small-text {
                  font-size: 12px !important;
              }
              
              .social-icon {
                  width: 20px !important;
                  height: 20px !important;
              }
              
              .outer-padding {
                  padding: 20px 10px !important;
              }
          }
          
          @media only screen and (max-width: 480px) {
              .verification-code {
                  font-size: 24px !important;
                  letter-spacing: 3px !important;
              }
          }
      </style>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Open Sans', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
              <td align="center" style="background-color: #d9edf7; padding: 40px 20px;" class="outer-padding">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; max-width: 600px;" class="main-container">
                      <tr>
                          <td style="padding: 24px 40px 40px 40px;" class="inner-content">
                              <!-- Logo -->
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                      <td align="center" style="padding-bottom: 30px;">
                                          <img src="https://www.refine.finance/static/media/refine.finance-logo.d91c50dfb3a5394a5ec2a32ca9d58bf8.svg" alt="Finance" style="max-width: 180px;" />
                                      </td>
                                  </tr>
                              </table>
  
                              <!-- Greeting -->
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                      <td style="padding-bottom: 10px;">
                                          <p style="margin: 0; font-size: 24px; color: #111; font-weight: 400;">
                                              Dear <strong style="font-weight: 700;">User,</strong>
                                          </p>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="padding-bottom: 25px;">
                                          <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.5;" class="body-text">
                                              This is your one time verification code.
                                          </p>
                                      </td>
                                  </tr>
                              </table>
  
                              <!-- Verification Code -->
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                      <td align="center" style="padding: 25px 0; background-color: #f5f5f5; border-radius: 4px;" class="code-container">
                                          <h2 style="margin: 0; font-size: 32px; color: #111; letter-spacing: 8px; font-weight: 700;" class="verification-code">
                                              ${otpDigits}
                                          </h2>
                                      </td>
                                  </tr>
                              </table>
  
                              <!-- Separator -->
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                      <td align="center" style="padding: 25px 0;">
                                          <hr style="background: #E6E6E6; border: none; height: 1px; margin: 0;">
                                      </td>
                                  </tr>
                              </table>
  
                              <!-- Validity Notice -->
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                      <td style="padding-bottom: 20px;">
                                          <p style="margin: 0; font-size: 13px; color: #333; line-height: 1.6;" class="small-text">
                                              This code is valid for 15 minutes. Once the code expires, you have to resubmit a request for code.
                                          </p>
                                      </td>
                                  </tr>
                              </table>
  
                              <!-- Support Information -->
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                      <td style="padding-bottom: 25px;">
                                          <p style="margin: 0; font-size: 13px; color: #333; line-height: 1.6;" class="small-text">
                                              If you have any questions or need assistance, don't hesitate to contact our support team at 
                                              <span style="color: #333; text-decoration: none;">marketing@refine.finance</span>.<br>
                                              Welcome aboard, and we look forward to helping you navigate the world of equity analysis with confidence!
                                          </p>
                                      </td>
                                  </tr>
                              </table>
  
                              <!-- Signature -->
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                      <td style="padding-bottom: 5px;">
                                          <p style="margin: 0; font-size: 14px; color: #333333; font-weight: 600;">
                                              Best regards,
                                          </p>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td style="padding-bottom: 15px;">
                                          <p style="margin: 0; font-size: 14px; color: #333333; font-weight: 600;">
                                              The Refine.Finance Team
                                          </p>
                                      </td>
                                  </tr>
                              </table>
  
                              <!-- Social Icons -->
                              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                      <td>
                                          <table cellpadding="0" cellspacing="0" border="0">
                                              <tr>
                                                  <td style="padding-right: 8px;">
                                                      <a href="#" style="text-decoration: none;">
                                                          <img src="${constants.linkedinIcon}" alt="LinkedIn" width="24" height="24" style="display: block; border: 0;" class="social-icon">
                                                      </a>
                                                  </td>
                                                  <td style="padding-right: 8px;">
                                                      <a href="#" style="text-decoration: none;">
                                                          <img src="${constants.facebookIcon}" alt="Facebook" width="24" height="24" style="display: block; border: 0;" class="social-icon">
                                                      </a>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
  
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
  </html>`;
};

app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  try {
    await transporter.sendMail({
      from: `"Refine Finance" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
      html: generateEmailHTML(otp),
    });

    console.log(`OTP sent to ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore[email];

  setTimeout(() => {
    if (!record)
      return res
        .status(400)
        .json({ success: false, message: "No OTP found for this email" });

    if (Date.now() > record.expiresAt)
      return res.status(400).json({ success: false, message: "OTP expired" });

    if (record.otp !== otp)
      return res.status(400).json({
        success: false,
        message:
          "The entered code is incorrect. Please try again and check for typos.",
      });

    delete otpStore[email];
    res.json({ success: true, message: "OTP verified successfully" });
  }, 5000); // 5000 ms = 5 seconds
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const userEmail = payload.email;
    const userName = payload.name;
    const userPicture = payload.picture;

    // Check if user exists in your database
    const publicKey = process.env.PUBLIC_KEY;
    const privateKey = process.env.PRIVATE_KEY;
    const text = publicKey + "|||##Glintler" + privateKey;
    const key = md5(text);

    const checkUserRes = await axios.post(
      process.env.BASE_URL + "admin/userlist",
      { userid: "" },
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          publickey: publicKey,
          key: key,
        },
      }
    );

    const existingUser = checkUserRes.data.data?.find(
      (user) => user.admin_email.toLowerCase() === userEmail.toLowerCase()
    );

    if (existingUser) {
      // USER EXISTS - LOGIN FLOW
      const appToken = jwt.sign(
        {
          userId: existingUser.admin_id,
          email: userEmail,
        },
        process.env.JWT_SECRET || "your-secret-key-here",
        { expiresIn: "7d" }
      );

      return res.json({
        success: true,
        isNewUser: false,
        user: {
          id: existingUser.admin_id,
          name: existingUser.admin_name,
          email: userEmail,
          picture: userPicture,
        },
        token: appToken,
      });
    } else {
      // NEW USER - SIGNUP FLOW
      const signupRes = await axios.post(
        process.env.BASE_URL + "signup",
        {
          email: userEmail,
          name: userName,
          password: Math.random().toString(36).slice(-8) + "G!1", // Random password
          f_name: userName.split(" ")[0] || userName,
          l_name: userName.split(" ").slice(1).join(" ") || "",
          phone: "",
          company_name: "",
          business_card_title: "",
          firm_description: "",
          country: "",
          message: "",
          subscription: 0,
          google_signup: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (signupRes.data.success) {
        const newUser = signupRes.data.user || signupRes.data.data;

        const appToken = jwt.sign(
          {
            userId: newUser.admin_id || newUser.id,
            email: userEmail,
          },
          process.env.JWT_SECRET || "your-secret-key-here",
          { expiresIn: "7d" }
        );

        return res.json({
          success: true,
          isNewUser: true,
          user: {
            id: newUser.admin_id || newUser.id,
            name: userName,
            email: userEmail,
            picture: userPicture,
          },
          token: appToken,
        });
      } else {
        throw new Error("Failed to create user");
      }
    }
  } catch (err) {
    console.error("Google Auth error:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Google authentication failed",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
