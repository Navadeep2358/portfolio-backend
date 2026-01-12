import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* ============================
   CORS (FRONTEND ONLY)
============================ */
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://pentelanavadeep.netlify.app/"
  ],
  methods: ["POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* ============================
   EMAIL TRANSPORT
============================ */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ============================
   CONTACT + AUTO-REPLY
============================ */
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1️⃣ EMAIL TO YOU
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `📩 New Contact: ${subject}`,
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
        <hr/>
        <p>Sent from your Portfolio Contact Page</p>
      `,
    });

    // 2️⃣ AUTO-REPLY TO VISITOR
    await transporter.sendMail({
      from: `"Navadeep Pentela" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thanks for reaching out!",
      html: `
        <p>Hi <b>${name}</b>,</p>
        <p>Thank you for contacting me through my portfolio.</p>
        <p>I’ve received your message and will get back to you as soon as possible.</p>
        <br/>
        <p>Best regards,</p>
        <p><b>Navadeep Pentela</b></p>
      `,
    });

    res.status(200).json({ message: "Message sent & auto-reply delivered" });

  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
});

/* ============================
   SERVER START
============================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
