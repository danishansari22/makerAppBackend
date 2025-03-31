const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class MailService {
  static async sendVendorOnboardingCompleteEmail(email, password) {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Your Vendor Onboarding is Complete',
      html: `
        <p>Welcome to Karkhana!</p>
        <p>Your onboarding is complete. You can now log in using the following credentials:</p>
        <p>Email: ${email}</p>
        <p>Password: ${password}</p>
        <p>Please change your password after logging in for the first time.</p>
        <a href="${process.env.FRONTEND_URL}/auth/login">Log In</a>
      `,
    };
    await sgMail.send(msg);
  }
  static async sendVendorOnboardingEmail(email, onboardingLink) {
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM,
      subject: 'Complete Your Vendor Onboarding',
      html: `
        <p>Welcome to Karkhana!</p>
        <p>Please complete your onboarding by clicking the link below:</p>
        <a href="${onboardingLink}">Complete Onboarding</a>
      `,
    };
    await sgMail.send(msg);
  }
  
  static async sendPasswordResetEmail(email, resetToken) {
    try {
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Reset Your Password - Karkhana Hub',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>You've requested to reset your password. Click the link below to set a new password:</p>
            <a href="${process.env.FRONTEND_URL}/auth/reset/new-password?token=${resetToken}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2C4ABE; color: white; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `
      };

      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error('Send mail error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendWelcomeEmail(email, firstName) {
    try {
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Welcome to Karkhana Hub!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Karkhana Hub, ${firstName}!</h2>
            <p>Thank you for joining our community. Here's what you can do next:</p>
            <ul>
              <li>Complete your profile</li>
              <li>Browse available machines</li>
              <li>Book your first session</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/home" 
               style="display: inline-block; padding: 12px 24px; background-color: #2C4ABE; color: white; text-decoration: none; border-radius: 5px;">
              Get Started
            </a>
          </div>
        `
      };

      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error('Send mail error:', error);
      return { success: false, error: error.message };
    }
  }

  static async sendBookingConfirmation(email, bookingDetails) {
    try {
      const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: 'Booking Confirmation - Karkhana Hub',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Booking Confirmed!</h2>
            <p>Your booking has been confirmed. Here are the details:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
              <p><strong>Machine:</strong> ${bookingDetails.machineName}</p>
              <p><strong>Date:</strong> ${bookingDetails.date}</p>
              <p><strong>Time:</strong> ${bookingDetails.time}</p>
              <p><strong>Duration:</strong> ${bookingDetails.duration}</p>
              <p><strong>Location:</strong> ${bookingDetails.location}</p>
            </div>
            <a href="${process.env.FRONTEND_URL}/bookings/${bookingDetails.id}" 
               style="display: inline-block; padding: 12px 24px; background-color: #2C4ABE; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">
              View Booking
            </a>
          </div>
        `
      };

      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error('Send mail error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = MailService;