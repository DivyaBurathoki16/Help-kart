import PageHeader from '../components/PageHeader';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <PageHeader
          title="Terms of Service"
          subtitle="Last updated: January 2026"
        />

        {/* Content */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 md:p-12 space-y-8 transition-colors duration-300">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              By accessing or using HelpKart ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Platform.
            </p>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
              HelpKart is a local service provider platform that connects customers with verified service providers. We facilitate bookings and transactions but are not a party to the actual service delivery between customers and providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">2. Definitions</h2>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li><strong>"Platform"</strong> refers to HelpKart website, mobile application, and related services</li>
              <li><strong>"Customer"</strong> refers to users who book services through the Platform</li>
              <li><strong>"Provider"</strong> refers to service professionals who offer services through the Platform</li>
              <li><strong>"Service"</strong> refers to any service offered by a Provider through the Platform</li>
              <li><strong>"Booking"</strong> refers to a confirmed service request made by a Customer</li>
              <li><strong>"We," "Us," "Our"</strong> refers to HelpKart and its operators</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">3. User Accounts</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">3.1 Account Registration</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              To use certain features of the Platform, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">3.2 Provider Verification</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Providers must undergo identity verification and background checks. We reserve the right to reject or suspend provider accounts that do not meet our verification standards or violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">4. Service Bookings</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">4.1 Booking Process</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              When you book a service:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>You create a booking request with specified date, time, and service details</li>
              <li>The Provider reviews and accepts or rejects the booking</li>
              <li>Upon acceptance, you must complete payment to confirm the booking</li>
              <li>Payment can be made via Cash on Delivery (COD), UPI, or Card</li>
              <li>For COD bookings, payment is made after service completion</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">4.2 Booking Confirmation</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              A booking is confirmed only after:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Provider accepts the booking request</li>
              <li>Payment is processed (for online payments) or payment method is selected (for COD)</li>
              <li>You receive a confirmation notification</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">4.3 Time Slot Availability</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We check for time slot conflicts before confirming bookings. If a requested time slot is unavailable, you will be notified and can select an alternative time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">5. Payments and Refunds</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">5.1 Payment Methods</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We accept the following payment methods:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li><strong>Cash on Delivery (COD):</strong> Payment made directly to the provider after service completion</li>
              <li><strong>UPI:</strong> Online payment via UPI platforms</li>
              <li><strong>Card:</strong> Credit or debit card payments</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">5.2 Pricing</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              All prices are displayed in the service listing and are set by Providers. Prices are final unless otherwise stated. Additional charges may apply for extra services requested during the service delivery.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">5.3 Refunds</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Refunds may be issued in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Service cancellation by Provider before service delivery</li>
              <li>Service quality issues reported and verified by our admin team</li>
              <li>Incomplete or unsatisfactory service delivery</li>
              <li>Damage caused by Provider during service delivery</li>
            </ul>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
              Refund decisions are made by our admin team based on evidence provided, including proof of work, issue reports, and customer feedback. Refunds are processed within 5-10 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">6. Service Delivery and Completion</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">6.1 Service Status</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Bookings progress through the following statuses:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li><strong>Pending:</strong> Booking request submitted, awaiting provider acceptance</li>
              <li><strong>Accepted:</strong> Provider accepted the booking</li>
              <li><strong>Confirmed:</strong> Payment processed and booking confirmed</li>
              <li><strong>In Progress:</strong> Provider has started the service</li>
              <li><strong>Provider Completed:</strong> Provider marks service as complete</li>
              <li><strong>Completed:</strong> Customer confirms completion or auto-completed after 48 hours</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">6.2 Proof of Work</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Providers may upload proof of work (photos/videos) upon service completion. Customers can review this proof before confirming completion.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">6.3 Issue Reporting</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              If you experience issues with service delivery, you can report them within 48 hours of service completion. Our admin team will review the issue and may:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Require the Provider to redo the service</li>
              <li>Issue a partial or full refund</li>
              <li>Resolve the issue through other appropriate means</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">7. Cancellations and Rescheduling</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">7.1 Customer Cancellations</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Customers may cancel bookings before the service date. Cancellation policies vary by service type. For paid bookings, refunds are processed according to our refund policy.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">7.2 Provider Cancellations</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Providers may cancel bookings with reasonable notice. If a Provider cancels after payment, a full refund will be issued to the Customer.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">7.3 Rescheduling</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Either party may request to reschedule a booking. Rescheduling is subject to availability and mutual agreement between Customer and Provider.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">8. Reviews and Ratings</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Customers may leave reviews and ratings after service completion. Reviews must be:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Honest and based on actual experience</li>
              <li>Free from offensive, defamatory, or inappropriate content</li>
              <li>Not used for personal attacks or harassment</li>
            </ul>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
              We reserve the right to remove reviews that violate these guidelines or our community standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">9. Behavior Reporting</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Users can report inappropriate behavior, including:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Harassment or abusive conduct</li>
              <li>Unprofessional behavior</li>
              <li>Safety concerns</li>
              <li>Violation of platform policies</li>
            </ul>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
              All reports are reviewed by our admin team, and appropriate action will be taken, which may include account suspension or termination.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">10. Provider Responsibilities</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Providers agree to:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Provide accurate service descriptions and pricing</li>
              <li>Maintain professional conduct and quality standards</li>
              <li>Arrive on time for scheduled appointments</li>
              <li>Complete services as described</li>
              <li>Carry appropriate licenses and insurance where required</li>
              <li>Respect customer property and privacy</li>
              <li>Respond promptly to booking requests and customer communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">11. Customer Responsibilities</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Customers agree to:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Provide accurate booking information and contact details</li>
              <li>Be present or available during scheduled service times</li>
              <li>Provide access to the service location</li>
              <li>Pay for services as agreed</li>
              <li>Treat Providers with respect and professionalism</li>
              <li>Report any issues promptly and accurately</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">12. Prohibited Activities</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Use the Platform for any illegal or unauthorized purpose</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit viruses, malware, or harmful code</li>
              <li>Attempt to gain unauthorized access to the Platform</li>
              <li>Interfere with or disrupt Platform operations</li>
              <li>Create fake accounts or impersonate others</li>
              <li>Circumvent payment systems or engage in fraudulent transactions</li>
              <li>Harass, abuse, or harm other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">13. Limitation of Liability</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              HelpKart acts as an intermediary platform connecting Customers and Providers. We are not responsible for:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>The quality, safety, or legality of services provided</li>
              <li>The accuracy of Provider information or service descriptions</li>
              <li>Disputes between Customers and Providers</li>
              <li>Damage to property or personal injury during service delivery</li>
              <li>Provider's failure to complete services as described</li>
            </ul>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
              To the maximum extent permitted by law, HelpKart's liability is limited to the amount you paid for the specific service in question.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">14. Intellectual Property</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              The Platform and its content, including logos, designs, text, graphics, and software, are owned by HelpKart and protected by intellectual property laws. You may not reproduce, modify, or distribute Platform content without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">15. Account Termination</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account if you:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Violate these Terms of Service</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Fail to pay for services</li>
              <li>Receive multiple complaints or behavior reports</li>
              <li>Abuse the Platform or other users</li>
            </ul>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
              You may terminate your account at any time by contacting us or using account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">16. Changes to Terms</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or Platform notifications. Continued use of the Platform after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">17. Governing Law</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms or your use of the Platform will be resolved through binding arbitration or in courts of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">18. Contact Information</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-slate-50 dark:bg-neutral-700/50 rounded-lg p-6">
              <p className="text-slate-700 dark:text-neutral-300 mb-2">
                <strong>Email:</strong> <a href="mailto:support@helpkart.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">support@helpkart.com</a>
              </p>
              <p className="text-slate-700 dark:text-neutral-300 mb-2">
                <strong>Phone:</strong> <a href="tel:+15551234567" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">+1 (555) 123-4567</a>
              </p>
              <p className="text-slate-700 dark:text-neutral-300">
                <strong>Address:</strong> HelpKart Support Team
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
