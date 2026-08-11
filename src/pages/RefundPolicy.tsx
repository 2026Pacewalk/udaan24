import LegalPage, { H2, P, UL, BusinessBlock } from '@/components/LegalPage';

export default function RefundPolicy() {
  return (
    <LegalPage title="Cancellation &amp; Refund Policy" subtitle="Our policy on course cancellations, refunds, and failed payments." updated="August 2026">
      <BusinessBlock />

      <P>This Cancellation &amp; Refund Policy applies to fees paid to Udaan24 AI Institute, operated by Udaan24 Educational Society, Kotkapura, for enrolment in our courses and programmes. Please read it carefully before making a payment.</P>

      <H2>Cancellation by the Student</H2>
      <UL>
        <li>A student may request cancellation of an enrolment by writing to <b>info@udaan24.com</b> from their registered email, or by contacting our centre, along with their name, Student ID, and payment reference.</li>
        <li>Cancellation requests are considered from the date and time they are received by us.</li>
      </UL>

      <H2>Refund Eligibility</H2>
      <UL>
        <li><b>Before the course/batch begins:</b> If you cancel within <b>7 days</b> of payment and before your course or batch has started, you are eligible for a refund of the tuition fee, less a non-refundable registration/processing charge of <b>10% of the fee (or ₹1,000, whichever is lower)</b> plus any applicable payment-gateway charges.</li>
        <li><b>After the course/batch begins:</b> Once classes have commenced, or study materials / online course access have been provided, the fee is <b>non-refundable</b>, as the service has been delivered.</li>
        <li><b>Registration / admission fees</b> are non-refundable.</li>
        <li>Discounts, offers, and referral benefits already availed are adjusted before calculating any refund.</li>
      </UL>

      <H2>Duplicate or Failed Payments</H2>
      <P>If you are charged more than once for the same enrolment due to a technical error, or an amount is debited but the enrolment is not confirmed, the extra/failed amount will be refunded in full to the original payment method. Please contact us with the transaction details and we will resolve it promptly.</P>

      <H2>How Refunds Are Processed</H2>
      <UL>
        <li>Approved refunds are made to the <b>original payment method</b> used for the transaction.</li>
        <li>Refunds are typically processed within <b>7–10 business days</b> of approval. The time for the amount to reflect in your account depends on your bank / payment provider.</li>
        <li>Refunds are issued in Indian Rupees (INR).</li>
      </UL>

      <H2>Non-Refundable Situations</H2>
      <UL>
        <li>Requests made after a course/batch has started or after course access has been granted.</li>
        <li>Registration/admission charges and payment-gateway fees.</li>
        <li>Cancellation due to a student's violation of our Terms &amp; Conditions or code of conduct.</li>
      </UL>

      <H2>Contact for Refunds</H2>
      <P>For any cancellation or refund request, contact Udaan24 AI Institute at <b>info@udaan24.com</b> or <b>+91 97808 43440</b>, Near Bus Stand, Kotkapura, Faridkot, Punjab 151204. We aim to respond to every request within 3 business days.</P>
    </LegalPage>
  );
}
