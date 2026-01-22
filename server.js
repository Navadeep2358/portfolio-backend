import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* ============================
   MIDDLEWARE
============================ */
app.use(cors({
  origin: "https://navadeepsportfolio.netlify.app",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ============================
   GMAIL SMTP
============================ */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/* ============================
   VERIFY EMAIL
============================ */
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email config error:", error);
  } else {
    console.log("✅ Email server ready");
  }
});

/* ============================
   HEALTH CHECK
============================ */
app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});

/* ============================
   CONTACT API
============================ */
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New Contact: ${subject}`,
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p>${message}</p>
      `
    });

    await transporter.sendMail({
      from: `"Navadeep Pentela" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thanks for contacting me!",
      html: `
        <p>Hi ${name},</p>
        <p>I’ve received your message and will reply soon.</p>
        <br/>
        <p>— Navadeep</p>
      `
    });

    res.status(200).json({ message: "Message sent successfully" });

  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ============================
   START SERVER
============================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
