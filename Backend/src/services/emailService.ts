import sendMail from "../config/sendMail.js";
import logger from "../utils/logger.js";

const sendEmailAsync = (to: string, subject: string, htmlContent: string) => {
  sendMail(to, subject, htmlContent).catch((err) => {
    logger.error(`Background email failed for ${to}: ${err.message}`);
  });
};

export const sendWelcomeEmail = (userEmail: string, userName: string) => {
  const htmlContent = `
    <h2>Welcome to CineFlow, ${userName}!</h2>
    <p>Your account has been created successfully.</p>
    <p>Start booking your favorite movies today.</p>
  `;
  sendEmailAsync(userEmail, "Welcome to CineFlow!", htmlContent);
};

export const sendLoginOtpEmail = (userEmail: string, otp: string) => {
  const htmlContent = `
    <h2>Login Verification</h2>
    <p>Your OTP for login is:</p>
    <h2 style="font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</h2>
    <p>This OTP will expire in 5 minutes.</p>
  `;
  sendEmailAsync(userEmail, "Your 2FA Login OTP", htmlContent);
};

export const sendPasswordResetEmail = (
  userEmail: string,
  resetLink: string,
) => {
  const htmlContent = `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetLink}" style="padding:10px 15px;background:#4f46e5;color:#fff;border-radius:4px;text-decoration:none;">
      Reset Password
    </a>
    <p>This link will expire in 15 minutes.</p>
  `;
  sendEmailAsync(userEmail, "Reset Your Password", htmlContent);
};

export const sendBookingConfirmationEmail = (
  userEmail: string,
  bookingId: string,
  movieTitle: string,
  showTime: string,
  seats: string[],
  theaterName: string,
) => {
  const seatsList = seats.join(", ");
  const htmlContent = `
    <h2>Booking Confirmed! 🎬</h2>
    <p><strong>Booking ID:</strong> ${bookingId}</p>
    <p><strong>Movie:</strong> ${movieTitle}</p>
    <p><strong>Theater:</strong> ${theaterName}</p>
    <p><strong>Show Time:</strong> ${showTime}</p>
    <p><strong>Seats:</strong> ${seatsList}</p>
    <p>Please show this email at the counter for ticket collection.</p>
  `;
  sendEmailAsync(userEmail, `Booking Confirmed: ${movieTitle}`, htmlContent);
};
