import nodemailer from 'nodemailer';

const sendEmail = async ({ email, subject, message }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.NEXT_PUBLIC_SMTP_SERVICE,
      secure: true,
      auth: {
        user: process.env.NEXT_PUBLIC_SMTP_MAIL,
        pass: process.env.NEXT_PUBLIC_SMTP_PASSWORD,
      },
    });

    const mailOptions = {
  from: process.env.NEXT_PUBLIC_SMTP_MAIL,
  to: process.env.NEXT_PUBLIC_SMTP_MAIL,  // You receive the message
  replyTo: email,             // You can reply to the user
  subject: subject,
  html: message,
};


    const info = await transporter.sendMail(mailOptions);
    console.log("Sending email to:", email);
    console.log("Email sent:", info.response);

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};


export default sendEmail;

