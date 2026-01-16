import express from 'express';
import Contact from '../models/Contact.js';
import { sendContactNotification } from '../utils/emailService.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form (PUBLIC)
// @access  Public
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message, company } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, subject, and message',
      });
    }

    // Create contact message
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      company: company || '',
    });

    // Send email notification to admin
    try {
      await sendContactNotification({
        name,
        email,
        subject,
        message,
        company: company || '',
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails, just log it
    }

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully. We will get back to you soon!',
      contact,
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit contact form',
    });
  }
});

export default router;
