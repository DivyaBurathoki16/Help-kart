import PageHeader from '../components/PageHeader';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <PageHeader
          title="Privacy Policy"
          subtitle="Last updated: January 2026"
        />

        {/* Content */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8 md:p-12 space-y-8 transition-colors duration-300">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">1. Introduction</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Welcome to HelpKart ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our local service provider platform.
            </p>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
              By using HelpKart, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">2.1 Personal Information</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Name, email address, phone number, and postal address</li>
              <li>Account credentials (username, password)</li>
              <li>Payment information (processed securely through third-party payment processors)</li>
              <li>Service booking details and preferences</li>
              <li>Reviews, ratings, and feedback</li>
              <li>Business information (for service providers)</li>
              <li>Identity verification documents (for provider verification)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              When you access our platform, we automatically collect:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, clicks, search queries)</li>
              <li>Location data (with your permission, to find nearby services)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>To provide, maintain, and improve our services</li>
              <li>To process bookings, payments, and service requests</li>
              <li>To verify provider identities and credentials</li>
              <li>To communicate with you about bookings, updates, and customer support</li>
              <li>To send promotional materials and service recommendations (with your consent)</li>
              <li>To detect, prevent, and address technical issues and fraudulent activity</li>
              <li>To comply with legal obligations and enforce our terms</li>
              <li>To analyze usage patterns and improve user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            
            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">4.1 Service Providers</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We share information with service providers who perform services on our behalf, such as payment processing, data analytics, email delivery, and hosting services.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">4.2 Between Users</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              When you book a service, we share necessary information (name, contact details, service address) with the service provider to facilitate the booking. Similarly, provider information is shared with customers for booking purposes.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">4.3 Legal Requirements</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We may disclose your information if required by law, court order, or government regulation, or to protect our rights, property, or safety, or that of our users.
            </p>

            <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-3 mt-6">4.4 Business Transfers</h3>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">5. Data Security</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security assessments and updates</li>
              <li>Limited access to personal information on a need-to-know basis</li>
            </ul>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">6. Your Rights and Choices</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-slate-700 dark:text-neutral-300 space-y-2 mb-4 ml-4">
              <li><strong>Access:</strong> Request access to your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
              <li><strong>Account Closure:</strong> Close your account at any time</li>
            </ul>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed">
              To exercise these rights, please contact us at <a href="mailto:support@helpkart.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">support@helpkart.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">7. Cookies and Tracking Technologies</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity on our platform and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">8. Children's Privacy</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">9. Data Retention</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">11. Contact Us</h2>
            <p className="text-slate-700 dark:text-neutral-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy, please contact us:
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

export default PrivacyPolicy;
