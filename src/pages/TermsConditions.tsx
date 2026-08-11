import LegalPage, { H2, P, UL, BusinessBlock } from '@/components/LegalPage';

export default function TermsConditions() {
  return (
    <LegalPage title="Terms &amp; Conditions" subtitle="The terms that govern your use of Udaan24 AI Institute's website and services." updated="August 2026">
      <BusinessBlock />

      <P>These Terms &amp; Conditions ("Terms") govern your access to and use of the website https://udaan24.com and the educational services offered by Udaan24 AI Institute, operated by Udaan24 Educational Society, Kotkapura ("Institute", "we", "us"). By accessing our website, enrolling in a course, or making a payment, you agree to these Terms.</P>

      <H2>Our Services</H2>
      <P>Udaan24 AI Institute provides education, coaching, and training programmes in computer, AI, programming, digital marketing, accounting, and related fields, delivered through classroom (offline), online, or hybrid modes, along with study materials, assessments, and certificates.</P>

      <H2>Eligibility &amp; Enrolment</H2>
      <UL>
        <li>You must provide accurate, complete, and current information during enquiry, registration, and admission.</li>
        <li>Admission is confirmed only after successful submission of the required details and applicable fee payment.</li>
        <li>Where a student is a minor, a parent or legal guardian must consent to and complete the admission and payment.</li>
      </UL>

      <H2>Fees &amp; Payments</H2>
      <UL>
        <li>Course fees are as listed on our website or as communicated at the time of admission, and may include registration, tuition, and examination components.</li>
        <li>Payments can be made online through our secure payment gateway, or offline (cash / UPI / bank transfer) at our centre, as permitted.</li>
        <li>All fees are quoted in Indian Rupees (INR). Applicable taxes, if any, are additional.</li>
        <li>Enrolment and access to a course are activated after payment is confirmed.</li>
      </UL>

      <H2>Student Responsibilities &amp; Conduct</H2>
      <UL>
        <li>Maintain the confidentiality of your login credentials; you are responsible for activity under your account.</li>
        <li>Use the courses, materials, and platform only for your own lawful, personal learning.</li>
        <li>Attend classes and complete assessments as per the programme requirements.</li>
      </UL>

      <H2>Intellectual Property</H2>
      <P>All course content, study materials, videos, logos, and website content are the property of Udaan24 AI Institute / Udaan24 Educational Society and are protected by law. You may not copy, reproduce, distribute, resell, or share them without our written permission.</P>

      <H2>Certificates</H2>
      <P>Certificates are issued upon successful completion of the applicable course requirements, including attendance, assessments, and fee clearance. Certificates can be verified on our website.</P>

      <H2>Limitation of Liability</H2>
      <P>We strive to provide quality education but do not guarantee any specific job, placement, income, or examination outcome. To the maximum extent permitted by law, Udaan24 AI Institute shall not be liable for any indirect or consequential losses arising from the use of our website or services.</P>

      <H2>Refunds &amp; Cancellations</H2>
      <P>Cancellations and refunds are governed by our <a href="/refund" className="text-[#0071E3] font-medium hover:underline">Cancellation &amp; Refund Policy</a>.</P>

      <H2>Governing Law &amp; Jurisdiction</H2>
      <P>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts at Faridkot / Kotkapura, Punjab.</P>

      <H2>Changes to These Terms</H2>
      <P>We may revise these Terms from time to time. Continued use of our website or services after changes constitutes acceptance of the revised Terms.</P>

      <H2>Contact Us</H2>
      <P>For any questions about these Terms, contact us at info@udaan24.com or +91 97808 43440, Near Bus Stand, Kotkapura, Faridkot, Punjab 151204.</P>
    </LegalPage>
  );
}
