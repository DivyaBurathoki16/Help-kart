import nodemailer from 'nodemailer';

// Create transporter using Brevo SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.BREVO_EMAIL || '9cf29c001@smtp-brevo.com',
      pass: process.env.BREVO_SMTP_KEY || 'qNDsMHEA2wvnWk9X',
    },
    tls: {
      rejectUnauthorized: false, // For development/testing
    },
  });
};

// Send contact form notification to admin
export const sendContactNotification = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const emailTo = process.env.EMAIL_TO || process.env.EMAIL || 'divyaburathoki16@gmail.com';
    const emailFrom = process.env.EMAIL_FROM || 'Divya Burathoki<divyaburathoki16@gmail.com>';

    const mailOptions = {
      from: emailFrom,
      to: emailTo,
      subject: `New Contact Form Submission: ${contactData.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-bottom: 20px;">New Contact Form Submission</h2>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #475569;">Name:</strong>
              <p style="color: #334155; margin: 5px 0;">${contactData.name}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #475569;">Email:</strong>
              <p style="color: #334155; margin: 5px 0;">
                <a href="mailto:${contactData.email}" style="color: #3b82f6; text-decoration: none;">${contactData.email}</a>
              </p>
            </div>
            
            ${contactData.company ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #475569;">Company:</strong>
              <p style="color: #334155; margin: 5px 0;">${contactData.company}</p>
            </div>
            ` : ''}
            
            <div style="margin-bottom: 15px;">
              <strong style="color: #475569;">Subject:</strong>
              <p style="color: #334155; margin: 5px 0;">${contactData.subject}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <strong style="color: #475569;">Message:</strong>
              <div style="color: #334155; margin: 5px 0; padding: 15px; background-color: #f1f5f9; border-radius: 4px; white-space: pre-wrap;">${contactData.message}</div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px;">
                You can reply directly to this email to respond to ${contactData.name}.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${contactData.name}
Email: ${contactData.email}
${contactData.company ? `Company: ${contactData.company}\n` : ''}Subject: ${contactData.subject}

Message:
${contactData.message}

---
You can reply directly to this email to respond to ${contactData.name}.
      `,
      replyTo: contactData.email,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending contact notification email:', error);
    throw error;
  }
};

// Send reply email to user
export const sendReplyToUser = async (userEmail, subject, message) => {
  try {
    const transporter = createTransporter();
    
    const emailFrom = process.env.EMAIL_FROM || 'Divya Burathoki<divyaburathoki16@gmail.com>';

    const mailOptions = {
      from: emailFrom,
      to: userEmail,
      subject: `Re: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Thank you for contacting us!</h2>
            
            <div style="margin-bottom: 20px; padding: 15px; background-color: #f1f5f9; border-radius: 4px; white-space: pre-wrap; color: #334155;">
              ${message}
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px;">
                This is an automated response. If you have any further questions, please don't hesitate to contact us again.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Thank you for contacting us!

${message}

---
This is an automated response. If you have any further questions, please don't hesitate to contact us again.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Reply email sent to user:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending reply email:', error);
    throw error;
  }
};

// Send OTP email for login
export const sendOTPEmail = async (email, otp, type = 'login') => {
  try {
    const transporter = createTransporter();
    
    const emailFrom = process.env.EMAIL_FROM || 'Divya Burathoki<divyaburathoki16@gmail.com>';
    
    const subject = type === 'login' 
      ? 'Login OTP Verification' 
      : 'Password Reset OTP';
    
    const title = type === 'login'
      ? 'Your Login OTP'
      : 'Your Password Reset OTP';
    
    const message = type === 'login'
      ? 'Use this OTP to complete your login. This OTP is valid for 5 minutes.'
      : 'Use this OTP to reset your password. This OTP is valid for 10 minutes.';

    const mailOptions = {
      from: emailFrom,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1e293b; margin-bottom: 20px;">${title}</h2>
            
            <div style="margin-bottom: 20px; padding: 20px; background-color: #f1f5f9; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #334155; margin-bottom: 15px;">
              ${message}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px;">
                If you didn't request this OTP, please ignore this email or contact support if you have concerns.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
${title}

Your OTP is: ${otp}

${message}

---
If you didn't request this OTP, please ignore this email or contact support if you have concerns.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`${type === 'login' ? 'Login' : 'Password reset'} OTP email sent to ${email}:`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Error sending ${type} OTP email:`, error);
    throw error;
  }
};

// Send welcome email to new users
export const sendWelcomeEmail = async (email, name, role) => {
  try {
    const transporter = createTransporter();
    
    const emailFrom = process.env.EMAIL_FROM || 'Divya Burathoki<divyaburathoki16@gmail.com>';
    
    const subject = 'Welcome to HelpKart! 🎉';
    
    // Role-specific welcome messages
    const welcomeContent = role === 'customer' 
      ? {
          title: 'Welcome to HelpKart! 🎉',
          greeting: `Hello ${name},`,
          mainMessage: 'We\'re thrilled to have you join our community!',
          description: 'HelpKart is your one-stop platform to discover and connect with trusted service providers in your area. Whether you need home repairs, cleaning services, or any other professional help, we\'ve got you covered.',
          features: [
            'Browse services near you',
            'Connect with verified service providers',
            'Book services easily and securely',
            'Track your bookings in real-time'
          ],
          cta: 'Start exploring services',
          ctaLink: process.env.FRONTEND_URL || 'http://localhost:5173',
          footerMessage: 'Enjoy finding trusted services near you and connecting with amazing service providers!'
        }
      : {
          title: 'Welcome to HelpKart! 🎉',
          greeting: `Hello ${name},`,
          mainMessage: 'We\'re excited to have you join our community as a service provider!',
          description: 'HelpKart is the perfect platform to showcase your services and connect with customers who need your expertise. Start offering your services today and grow your business with us.',
          features: [
            'Create and manage your service listings',
            'Connect with customers in your area',
            'Manage bookings and appointments',
            'Build your reputation with reviews'
          ],
          cta: 'Set up your profile',
          ctaLink: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/provider/dashboard` : 'http://localhost:5173/provider/dashboard',
          footerMessage: 'Start offering your services and connect with customers who need your expertise!'
        };

    const mailOptions = {
      from: emailFrom,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, ${role === 'customer' ? '#3b82f6' : '#10b981'} 0%, ${role === 'customer' ? '#2563eb' : '#059669'} 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${welcomeContent.title}</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">
              ${welcomeContent.greeting}
            </p>
            
            <p style="color: #1e293b; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
              ${welcomeContent.mainMessage}
            </p>
            
            <p style="color: #334155; line-height: 1.6; margin-bottom: 25px;">
              ${welcomeContent.description}
            </p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <p style="color: #475569; font-weight: bold; margin-bottom: 15px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">What you can do:</p>
              <ul style="color: #334155; margin: 0; padding-left: 20px; line-height: 1.8;">
                ${welcomeContent.features.map(feature => `<li>${feature}</li>`).join('')}
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${welcomeContent.ctaLink}" style="display: inline-block; background: linear-gradient(135deg, ${role === 'customer' ? '#3b82f6' : '#10b981'} 0%, ${role === 'customer' ? '#2563eb' : '#059669'} 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                ${welcomeContent.cta} →
              </a>
            </div>
            
            <p style="color: #334155; line-height: 1.6; margin-top: 25px;">
              ${welcomeContent.footerMessage}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 12px; margin-bottom: 5px;">
                If you have any questions, feel free to reach out to our support team.
              </p>
              <p style="color: #64748b; font-size: 12px; margin: 0;">
                Welcome aboard!<br>
                The HelpKart Team
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
${welcomeContent.title}

${welcomeContent.greeting}

${welcomeContent.mainMessage}

${welcomeContent.description}

What you can do:
${welcomeContent.features.map((feature, index) => `${index + 1}. ${feature}`).join('\n')}

${welcomeContent.footerMessage}

${welcomeContent.cta}: ${welcomeContent.ctaLink}

---
If you have any questions, feel free to reach out to our support team.

Welcome aboard!
The HelpKart Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email} (${role}):`, info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};