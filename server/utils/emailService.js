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

<<<<<<< HEAD
// Format date & time for booking emails
const formatBookingDateTime = (bookingDate, bookingTime) => {
  try {
    const date = bookingDate instanceof Date ? bookingDate : new Date(bookingDate);
    const dateStr = date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    return `${dateStr} at ${bookingTime}`;
  } catch {
    return `${bookingTime}`;
  }
};

// Notify customer about booking status updates (accepted / confirmed)
export const sendBookingStatusEmail = async (booking, statusType = 'accepted') => {
  // Guard: ensure we have customer email
  const customerEmail = booking?.customer?.email;
  if (!customerEmail) {
    console.warn('Skipping booking status email: customer email not found');
    return;
  }

  const transporter = createTransporter();
  const emailFrom = process.env.EMAIL_FROM || 'HelpKart <no-reply@helpkart.com>';

  const customerName = booking.customer.name || 'Customer';
  const serviceTitle = booking.service?.title || 'your service';
  const providerName = booking.provider?.businessName || 'your provider';
  const when = formatBookingDateTime(booking.bookingDate, booking.bookingTime);

  const isConfirmed = statusType === 'confirmed';

  const subject = isConfirmed
    ? 'Your booking is confirmed'
    : 'Your booking was accepted by the provider';

  const title = isConfirmed ? 'Your booking is confirmed' : 'Booking accepted';
  const leadMessage = isConfirmed
    ? `Good news! Your booking is now confirmed.`
    : `Good news! Your provider has accepted your booking request.`;

  const mailOptions = {
    from: emailFrom,
    to: customerEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 6px rgba(15,23,42,0.08);">
          <h2 style="color: #0f172a; margin-bottom: 8px;">${title}</h2>
          <p style="color: #334155; margin-top: 0;">Hi ${customerName},</p>
          <p style="color: #334155; line-height: 1.6; margin-bottom: 16px;">
            ${leadMessage}
          </p>

          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Service</p>
            <p style="margin: 0 0 10px; color: #0f172a; font-weight: 600;">${serviceTitle}</p>

            <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Provider</p>
            <p style="margin: 0 0 10px; color: #0f172a;">${providerName}</p>

            <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Scheduled for</p>
            <p style="margin: 0; color: #0f172a;">${when}</p>
          </div>

          ${
            isConfirmed
              ? `<p style="color: #334155; margin-bottom: 16px;">
                   We’ll remind you again closer to the time. If you need to reschedule or cancel, you can do it from the HelpKart app.
                 </p>`
              : `<p style="color: #334155; margin-bottom: 16px;">
                   Next step: choose a payment method and confirm your booking from the app (if required).
                 </p>`
          }

          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
            This is an automated message from HelpKart. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    `,
    text: `
${title}

Hi ${customerName},

${leadMessage}

Service: ${serviceTitle}
Provider: ${providerName}
When: ${when}

${isConfirmed
  ? 'We will remind you again closer to the time. You can reschedule or cancel from the HelpKart app if needed.'
  : 'Next step: choose a payment method and confirm your booking from the app (if required).'}

---
This is an automated message from HelpKart. Please do not reply directly to this email.
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Booking ${statusType} email sent to ${customerEmail}:`, info.messageId);
  return { success: true, messageId: info.messageId };
};

// Notify provider when a new booking is created
export const sendNewBookingNotificationToProvider = async (payload) => {
  const {
    providerEmail,
    providerName,
    customerName,
    serviceTitle,
    bookingDate,
    bookingTime,
    bookingId,
    address,
    notes,
  } = payload || {};

  if (!providerEmail) {
    console.warn('Skipping provider new booking email: provider email not found');
    return;
  }

  const transporter = createTransporter();
  const emailFrom = process.env.EMAIL_FROM || 'HelpKart <no-reply@helpkart.com>';

  const when = formatBookingDateTime(bookingDate, bookingTime);

  const subject = 'You have a new booking request on HelpKart';

  const formattedAddress =
    address && (address.street || address.city || address.state || address.zipCode || address.country)
      ? [
          address.street,
          address.city,
          address.state,
          address.zipCode,
          address.country,
        ]
          .filter(Boolean)
          .join(', ')
      : null;

  const mailOptions = {
    from: emailFrom,
    to: providerEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 6px rgba(15,23,42,0.08);">
          <h2 style="color: #0f172a; margin-bottom: 8px;">New booking request</h2>
          <p style="color: #334155; margin-top: 0;">Hi ${providerName || 'Provider'},</p>
          <p style="color: #334155; line-height: 1.6; margin-bottom: 16px;">
            You have received a new booking request from <strong>${customerName || 'a customer'}</strong> for
            <strong>${serviceTitle || 'your service'}</strong>.
          </p>

          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Scheduled for</p>
            <p style="margin: 0 0 10px; color: #0f172a;">${when}</p>

            ${
              formattedAddress
                ? `
            <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Address</p>
            <p style="margin: 0; color: #0f172a;">${formattedAddress}</p>
            `
                : ''
            }
          </div>

          ${
            notes
              ? `
          <div style="background-color: #fffbeb; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #facc15;">
            <p style="margin: 0 0 4px; color: #854d0e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Customer notes</p>
            <p style="margin: 0; color: #713f12; white-space: pre-wrap;">${notes}</p>
          </div>
          `
              : ''
          }

          <p style="color: #334155; margin-bottom: 12px;">
            Please review this booking and accept or reject it from your HelpKart provider dashboard.
          </p>

          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
            Booking ID: ${bookingId || 'N/A'}
          </p>
        </div>
      </div>
    `,
    text: `
New booking request

Hi ${providerName || 'Provider'},

You have received a new booking request from ${customerName || 'a customer'} for ${serviceTitle || 'your service'}.

Scheduled for: ${when}
${
  formattedAddress
    ? `
Address: ${formattedAddress}
`
    : ''
}
${
  notes
    ? `
Customer notes:
${notes}
`
    : ''
}
Booking ID: ${bookingId || 'N/A'}
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('New booking notification email sent to provider:', info.messageId);
  return { success: true, messageId: info.messageId };
};

=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
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
<<<<<<< HEAD
};

// Notify provider when a behavior report is submitted against them
export const sendBehaviorReportSubmittedEmail = async (payload) => {
  const {
    providerEmail,
    providerName,
    customerName,
    issueType,
    description,
    bookingDate,
    bookingTime,
    bookingId,
  } = payload || {};

  if (!providerEmail) {
    console.warn('Skipping behavior report submitted email: provider email not found');
    return;
  }

  const transporter = createTransporter();
  const emailFrom = process.env.EMAIL_FROM || 'HelpKart <no-reply@helpkart.com>';

  const when = bookingDate && bookingTime ? formatBookingDateTime(bookingDate, bookingTime) : null;

  const subject = 'A customer has reported an issue with a recent booking';

  const mailOptions = {
    from: emailFrom,
    to: providerEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 6px rgba(15,23,42,0.08);">
          <h2 style="color: #0f172a; margin-bottom: 8px;">Customer behavior report submitted</h2>
          <p style="color: #334155; margin-top: 0;">Hi ${providerName || 'Provider'},</p>
          <p style="color: #334155; line-height: 1.6; margin-bottom: 16px;">
            A customer (${customerName || 'a customer'}) has submitted a behavior report related to one of your bookings.
          </p>

          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Issue type</p>
            <p style="margin: 0 0 10px; color: #0f172a;">${issueType || 'N/A'}</p>

            ${
              when
                ? `
            <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Booking time</p>
            <p style="margin: 0; color: #0f172a;">${when}</p>
            `
                : ''
            }
          </div>

          <div style="background-color: #fffbeb; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #facc15;">
            <p style="margin: 0 0 4px; color: #854d0e; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Customer description</p>
            <p style="margin: 0; color: #713f12; white-space: pre-wrap;">${description || 'N/A'}</p>
          </div>

          <p style="color: #334155; margin-bottom: 12px;">
            Our admin team will review this report and may take appropriate action if required.
          </p>

          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
            Booking ID: ${bookingId || 'N/A'}
          </p>
        </div>
      </div>
    `,
    text: `
Customer behavior report submitted

Hi ${providerName || 'Provider'},

A customer (${customerName || 'a customer'}) has submitted a behavior report related to one of your bookings.

Issue type: ${issueType || 'N/A'}
${when ? `Booking time: ${when}\n` : ''}

Customer description:
${description || 'N/A'}

Booking ID: ${bookingId || 'N/A'}
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Behavior report submitted email sent to provider:', info.messageId);
  return { success: true, messageId: info.messageId };
};

// Notify provider when admin reviews/takes action on a behavior report
export const sendBehaviorReportReviewedEmail = async (payload) => {
  const {
    providerEmail,
    providerName,
    actionTaken,
    adminNotes,
    issueType,
    bookingId,
  } = payload || {};

  if (!providerEmail) {
    console.warn('Skipping behavior report reviewed email: provider email not found');
    return;
  }

  const transporter = createTransporter();
  const emailFrom = process.env.EMAIL_FROM || 'HelpKart <no-reply@helpkart.com>';

  const subject = 'Update on behavior report review from HelpKart';

  const actionLabel =
    actionTaken === 'warning'
      ? 'Warning issued'
      : actionTaken === 'temporary_suspension'
      ? 'Temporary suspension'
      : actionTaken === 'permanent_ban'
      ? 'Permanent ban'
      : 'No action taken';

  const mailOptions = {
    from: emailFrom,
    to: providerEmail,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 6px rgba(15,23,42,0.08);">
          <h2 style="color: #0f172a; margin-bottom: 8px;">Behavior report reviewed</h2>
          <p style="color: #334155; margin-top: 0;">Hi ${providerName || 'Provider'},</p>
          <p style="color: #334155; line-height: 1.6; margin-bottom: 16px;">
            Our admin team has reviewed a behavior report related to your account.
          </p>

          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Issue type</p>
            <p style="margin: 0 0 10px; color: #0f172a;">${issueType || 'N/A'}</p>

            <p style="margin: 0 0 4px; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Action taken</p>
            <p style="margin: 0; color: #0f172a;">${actionLabel}</p>
          </div>

          ${
            adminNotes
              ? `
          <div style="background-color: #eff6ff; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #bfdbfe;">
            <p style="margin: 0 0 4px; color: #1d4ed8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Admin notes</p>
            <p style="margin: 0; color: #1e40af; white-space: pre-wrap;">${adminNotes}</p>
          </div>
          `
              : ''
          }

          <p style="color: #334155; margin-bottom: 12px;">
            If you have any questions about this decision, please contact HelpKart support.
          </p>

          <p style="color: #64748b; font-size: 12px; margin-top: 24px;">
            Booking ID: ${bookingId || 'N/A'}
          </p>
        </div>
      </div>
    `,
    text: `
Behavior report reviewed

Hi ${providerName || 'Provider'},

Our admin team has reviewed a behavior report related to your account.

Issue type: ${issueType || 'N/A'}
Action taken: ${actionLabel}

${adminNotes ? `Admin notes:\n${adminNotes}\n\n` : ''}
Booking ID: ${bookingId || 'N/A'}
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Behavior report reviewed email sent to provider:', info.messageId);
  return { success: true, messageId: info.messageId };
=======
>>>>>>> ee5694c89638ac804a1e46c27de9bc857dfb54d0
};