import { Link } from 'react-router-dom';
import { FileText, CheckCircle, AlertCircle, Scale, CreditCard, ShieldAlert } from 'lucide-react';
import PageHeader from '../../components/public/WebsitePageHeader';
import AnimatedSection from '../../components/public/AnimatedSection';
import SEO from '../../components/public/SEO';

function TermsAndConditions() {
  return (
    <>
      <SEO title="Terms and Conditions | FinFiler" description="Read FinFiler's Terms and Conditions for using our platform and services." />
      <div className="legal-page">
          <p>
            These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the FinFiler mobile
            application, website{' '}
            <a href="https://finfiler.com" target="_blank" rel="noopener noreferrer">https://finfiler.com</a>, client
            portal{' '}
            <a href="https://app.finfiler.com" target="_blank" rel="noopener noreferrer">https://app.finfiler.com</a>,
            and all services provided by FinFiler Private Limited (&quot;FinFiler&quot;, &quot;Company&quot;, &quot;we&quot;,
            &quot;our&quot;, or &quot;us&quot;).
          </p>
          <p>
            By accessing, registering, or using any FinFiler service, you agree to be bound by these Terms. If you do not
            agree with these Terms, you must not use our services.
          </p>

          <h2>1. Company Information</h2>
          <p>
            <strong>Legal Name:</strong> FinFiler Private Limited
            <br />
            <br />
            <strong>Registered Office:</strong>
            <br />
            Wahab Nagar, Sunarupatty,
            <br />
            Kharupetia, Darrang,
            <br />
            Assam – 784115, India
            <br />
            <br />
            <strong>Support Email:</strong>{' '}
            <a href="mailto:support@finfiler.com">support@finfiler.com</a>
            <br />
            <strong>Support Phone:</strong> +91 7002695990
          </p>

          <h2>2. Eligibility</h2>
          <p>To use FinFiler services, you must:</p>
          <ul>
            <li>Be at least 18 years of age.</li>
            <li>Be legally capable of entering into a binding contract under applicable Indian laws.</li>
            <li>Provide accurate and complete information during registration and service requests.</li>
          </ul>
          <p>
            FinFiler reserves the right to refuse service, suspend accounts, or terminate access if eligibility
            requirements are not met.
          </p>

          <h2>3. Services Offered</h2>
          <p>FinFiler provides professional assistance and compliance-related services including, but not limited to:</p>
          <ul>
            <li>GST Registration</li>
            <li>GST Return Filing</li>
            <li>Income Tax Return Filing</li>
            <li>Udyam/MSME Registration</li>
            <li>Company Incorporation</li>
            <li>LLP Registration</li>
            <li>Partnership Registration</li>
            <li>Trademark Registration</li>
            <li>Professional Tax Registration</li>
            <li>Accounting &amp; Bookkeeping</li>
            <li>TDS Return Filing</li>
            <li>ROC Compliance Services</li>
            <li>Other business, tax, and regulatory compliance services introduced from time to time</li>
          </ul>
          <p>FinFiler may modify, add, suspend, or discontinue any service without prior notice.</p>

          <h2>4. User Registration and Account</h2>
          <p>Users may register using Mobile OTP verification.</p>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate and current information.</li>
            <li>Maintain the confidentiality of your account.</li>
            <li>Immediately notify FinFiler of any unauthorized use of your account.</li>
            <li>Accept responsibility for activities conducted through your account.</li>
          </ul>
          <p>
            Users cannot transfer their accounts to another individual or entity without written approval from FinFiler.
          </p>

          <h2>5. User Responsibilities</h2>
          <p>You agree that:</p>
          <ul>
            <li>All information submitted is true, complete, and accurate.</li>
            <li>Documents uploaded are genuine and legally valid.</li>
            <li>You possess the authority to submit information on behalf of your business or organization.</li>
            <li>You will cooperate by providing additional information whenever required for service completion.</li>
          </ul>
          <p>
            You are solely responsible for any consequences arising from false, misleading, incomplete, or fraudulent
            information.
          </p>

          <h2>6. Professional Services</h2>
          <p>
            FinFiler coordinates and manages professional services through its internal team and, where required,
            qualified professionals including Chartered Accountants and other licensed practitioners.
          </p>
          <p>FinFiler is not a marketplace connecting users with unrelated third-party service providers.</p>
          <p>
            Professional opinions, filings, certifications, and submissions may depend upon information provided by the
            user.
          </p>

          <h2>7. Document Submission</h2>
          <p>Users may upload documents including:</p>
          <ul>
            <li>PAN Card</li>
            <li>Aadhaar Card</li>
            <li>GST Certificates</li>
            <li>Bank Statements</li>
            <li>Financial Records</li>
            <li>Business Registration Documents</li>
            <li>Tax Documents</li>
            <li>Compliance Records</li>
          </ul>
          <p>Users represent that:</p>
          <ul>
            <li>They own or are authorized to use such documents.</li>
            <li>The documents do not violate any law or third-party rights.</li>
            <li>The documents are accurate and current.</li>
          </ul>

          <h2>8. Service Timelines</h2>
          <p>Estimated service timelines displayed by FinFiler are indicative only.</p>
          <p>Actual completion may depend on:</p>
          <ul>
            <li>Government department processing times</li>
            <li>Regulatory approvals</li>
            <li>User responsiveness</li>
            <li>Accuracy of submitted information</li>
            <li>Third-party requirements</li>
          </ul>
          <p>
            FinFiler does not guarantee approval, registration, certification, or processing timelines by government
            authorities.
          </p>

          <h2>9. Fees and Payments</h2>
          <p>
            Service fees may be displayed through the application, website, quotations, or invoices.
          </p>
          <p>Payments may be processed through:</p>
          <ul>
            <li>Razorpay</li>
            <li>Cashfree</li>
            <li>Open Money</li>
            <li>Get E Pay</li>
          </ul>
          <p>
            Users agree to pay all applicable fees before or during service execution as required.
          </p>
          <p>
            Government fees, filing fees, statutory fees, and professional fees may be charged separately unless
            expressly stated otherwise.
          </p>

          <h2>10. Refunds</h2>
          <p>Refund requests are evaluated on a case-by-case basis.</p>
          <p>Refund eligibility depends on factors including:</p>
          <ul>
            <li>Service stage</li>
            <li>Work already completed</li>
            <li>Government fees incurred</li>
            <li>Third-party costs incurred</li>
            <li>Nature of the service requested</li>
          </ul>
          <p>
            Where service failure is attributable to FinFiler, full or partial refunds may be issued at FinFiler&apos;s
            discretion.
          </p>
          <p>The detailed Refund and Cancellation Policy forms an integral part of these Terms.</p>

          <h2>11. Communication Consent</h2>
          <p>By using FinFiler services, you consent to receiving communications through:</p>
          <ul>
            <li>WhatsApp</li>
            <li>SMS</li>
            <li>Email</li>
            <li>Phone Calls</li>
            <li>Push Notifications</li>
          </ul>
          <p>These communications may include:</p>
          <ul>
            <li>Service updates</li>
            <li>Compliance reminders</li>
            <li>Payment notifications</li>
            <li>Document requests</li>
            <li>Account-related communications</li>
            <li>Marketing communications where permitted by law</li>
          </ul>

          <h2>12. Intellectual Property</h2>
          <p>
            All rights relating to the FinFiler platform, website, application, software, branding, content, logos,
            graphics, and materials remain the exclusive property of FinFiler Private Limited.
          </p>
          <p>Users may not:</p>
          <ul>
            <li>Copy</li>
            <li>Modify</li>
            <li>Reverse engineer</li>
            <li>Redistribute</li>
            <li>Reproduce</li>
            <li>Sell</li>
            <li>License</li>
          </ul>
          <p>any part of the platform without prior written consent.</p>

          <h2>13. Prohibited Activities</h2>
          <p>Users shall not:</p>
          <ul>
            <li>Upload fraudulent documents.</li>
            <li>Violate applicable laws.</li>
            <li>Misrepresent identity.</li>
            <li>Attempt unauthorized access to systems.</li>
            <li>Disrupt platform operations.</li>
            <li>Use the platform for illegal activities.</li>
            <li>Upload malicious software or harmful code.</li>
          </ul>
          <p>
            Violation may result in account suspension, termination, legal action, or reporting to authorities.
          </p>

          <h2>14. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law:</p>
          <p>FinFiler shall not be liable for:</p>
          <ul>
            <li>Government rejection of applications</li>
            <li>Delays by authorities</li>
            <li>Regulatory actions</li>
            <li>Business losses</li>
            <li>Loss of profits</li>
            <li>Indirect damages</li>
            <li>Consequential damages</li>
            <li>Data loss caused by factors beyond FinFiler&apos;s control</li>
          </ul>
          <p>
            The total liability of FinFiler shall not exceed the amount paid by the user for the specific service giving
            rise to the claim.
          </p>

          <h2>15. No Professional Relationship Until Engagement</h2>
          <p>
            Browsing the website, application, or requesting information does not automatically create a
            professional-client relationship.
          </p>
          <p>
            Such relationship arises only upon acceptance of engagement and completion of required onboarding
            procedures.
          </p>

          <h2>16. Data Retention</h2>
          <p>
            Customer records and uploaded documents may be retained for up to eight (8) years after service completion
            for legal, taxation, audit, compliance, and regulatory purposes.
          </p>
          <p>Certain records may be retained for longer periods where required by law.</p>

          <h2>17. Account Suspension and Termination</h2>
          <p>FinFiler may suspend or terminate accounts if:</p>
          <ul>
            <li>False information is submitted.</li>
            <li>Fraudulent activity is suspected.</li>
            <li>Terms are violated.</li>
            <li>Legal or regulatory obligations require such action.</li>
          </ul>
          <p>Termination does not relieve users of outstanding payment obligations.</p>

          <h2>18. Privacy</h2>
          <p>
            Use of FinFiler services is also governed by the{' '}
            <Link to="/privacy-policy">Privacy Policy</Link>.
          </p>
          <p>Users are encouraged to review the Privacy Policy before using the platform.</p>

          <h2>19. Amendments</h2>
          <p>FinFiler reserves the right to modify these Terms at any time.</p>
          <p>
            Updated Terms will become effective upon publication on the website, application, or portal.
          </p>
          <p>
            Continued use of the services after publication constitutes acceptance of the revised Terms.
          </p>

          <h2>20. Governing Law and Jurisdiction</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of India.</p>
          <p>
            Any dispute arising out of or relating to these Terms, the website, application, portal, or services shall
            be subject to the exclusive jurisdiction of the competent courts located in Darrang, Assam, India.
          </p>

          <h2>21. Contact Information</h2>
          <p>
            <strong>FinFiler Private Limited</strong>
            <br />
            <br />
            Wahab Nagar, Sunarupatty,
            <br />
            Kharupetia,
            <br />
            Darrang, Assam – 784115
            <br />
            <br />
            Email: <a href="mailto:support@finfiler.com">support@finfiler.com</a>
            <br />
            Phone: +91 7002695990
            <br />
            Website:{' '}
            <a href="https://finfiler.com" target="_blank" rel="noopener noreferrer">https://finfiler.com</a>
          </p>
        </div>
    </>
  );
}

export default TermsAndConditions;
