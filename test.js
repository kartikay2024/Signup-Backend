const express = require("express");
const { OAuth2Client } = require("google-auth-library");
const md5 = require("md5");
const User = require("./models/User"); // Your User model
const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/api/auth/google", async (req, res) => {
  try {
    const { token } = req.body;

    // 1️⃣ Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const userEmail = payload.email.toLowerCase();
    const userName = payload.name;
    const userPicture = payload.picture || "";

    // 2️⃣ Check if user exists
    let existingUser = await User.findOne({ admin_email: userEmail });

    if (existingUser) {
      // ✅ Existing user: set cookies in backend
      const remember = true; // Or get from frontend
      const expiryDate = new Date(
        Date.now() + (remember ? 2592000000 : 86400000 * 6)
      );

      // ✅ Return response in your required format
      return res.json({
        data: [
          {
            user_id: existingUser._id,
            user_fullname: existingUser.admin_name,
            admin_email: existingUser.admin_email,
            login_type: "google",
            profile_image: existingUser.profile_image || "",
            is_registered: existingUser.is_registered || 1,
          },
        ],
      });
    }

    // 3️⃣ New user: signup flow, just return user object (frontend sets cookies)
    const newUser = new User({
      admin_email: userEmail,
      admin_name: userName,
      profile_image: userPicture,
      login_type: "google",
      is_registered: 1,
      password: Math.random().toString(36).slice(-8) + "G!1",
    });

    const savedUser = await newUser.save();

    return res.json({
      data: [
        {
          user_id: savedUser._id,
          user_fullname: savedUser.admin_name,
          admin_email: savedUser.admin_email,
          login_type: "google",
          profile_image: savedUser.profile_image || "",
          is_registered: savedUser.is_registered || 1,
        },
      ],
    });
  } catch (err) {
    console.error("Google Auth error:", err);
    res.status(400).json({
      success: false,
      message: err.message || "Google authentication failed",
    });
  }
});

module.exports = router;
