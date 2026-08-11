import LegalPage, { H2, P, UL, BusinessBlock } from '@/components/LegalPage';

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" subtitle="How Udaan24 AI Institute collects, uses, and protects your information." updated="August 2026">
      <BusinessBlock />

      <P>This Privacy Policy explains how Udaan24 AI Institute, run by Udaan24 Educational Society, Kotkapura ("we", "us", "our"), collects, uses, discloses, and safeguards your information when you visit https://udaan24.com, enrol in our courses, or use our services. By using our website and services, you agree to the practices described in this policy.</P>

      <H2>Information We Collect</H2>
      <UL>
        <li><b>Personal details</b> you provide during enquiry, registration, admission or payment — such as name, parent/guardian name, date of birth, gender, address, phone number, email, and academic details.</li>
        <li><b>Identity documents</b> (for example Aadhaar number) only where required for admission and record-keeping.</li>
        <li><b>Payment information</b> processed securely through our third-party payment gateway. We do <b>not</b> store your card, UPI, or bank credentials on our servers.</li>
        <li><b>Usage data</b> such as pages visited, device and browser type, and cookies, used to improve the website.</li>
      </UL>

      <H2>How We Use Your Information</H2>
      <UL>
        <li>To process enquiries, admissions, enrolments, and payments.</li>
        <li>To provide course access, classes, study materials, examinations, certificates, and student support.</li>
        <li>To communicate important updates, fee reminders, results, and service-related notices.</li>
        <li>To comply with legal, accounting, and regulatory obligations.</li>
        <li>To improve our courses, website, and overall student experience.</li>
      </UL>

      <H2>Payment Processing</H2>
      <P>Online payments are handled by PCI-DSS compliant third-party payment gateways. When you make a payment, your payment details are transmitted directly to the payment gateway over a secure, encrypted connection. We only receive a confirmation of the transaction (such as a transaction ID and status), not your full payment credentials.</P>

      <H2>Cookies</H2>
      <P>We use essential cookies to keep you logged in and to remember your preferences, and may use analytics cookies to understand how the site is used. You can control cookies through your browser settings; disabling essential cookies may affect certain features.</P>

      <H2>Sharing of Information</H2>
      <P>We do not sell or rent your personal information. We share information only with: (a) payment gateways to process transactions; (b) service providers who help us operate the website and deliver services, under confidentiality obligations; (c) authorities where required by law; and (d) our affiliated study centres for the purpose of delivering your admitted course.</P>

      <H2>Data Security</H2>
      <P>We use reasonable administrative, technical, and physical safeguards to protect your information. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</P>

      <H2>Your Rights</H2>
      <P>You may request access to, correction of, or deletion of your personal data, subject to legal and record-keeping requirements, by contacting us at info@udaan24.com.</P>

      <H2>Children's Information</H2>
      <P>Where a student is a minor, admission and payment details are provided and consented to by a parent or legal guardian.</P>

      <H2>Changes to This Policy</H2>
      <P>We may update this Privacy Policy from time to time. The latest version will always be available on this page with its effective date.</P>

      <H2>Contact Us</H2>
      <P>For any questions about this Privacy Policy or your data, contact Udaan24 AI Institute at info@udaan24.com or +91 97808 43440, Batian Wala Chownk, Above Punjab &amp; Sind Bank, Kotkapura, Punjab 151204.</P>
    </LegalPage>
  );
}
