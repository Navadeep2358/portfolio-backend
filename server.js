import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});

// Contact API
app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1️⃣ Email TO YOU
    await resend.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: ["navadeeppentela@gmail.com"],
      subject: `New Contact: ${subject}`,
      html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
    });

    // 2️⃣ Auto-reply TO USER (IMPORTANT FIX)
    await resend.emails.send({
      from: "Navadeep <onboarding@resend.dev>",
      to: [email],
      reply_to: "navadeeppentela@gmail.com",
      subject: "Thanks for contacting me!",
      html: `
        <p>Hi ${name},</p>
        <p>Thanks for reaching out! I’ve received your message and will get back to you soon.</p>
        <br/>
        <p>— Navadeep</p>
      `,
    });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
