import LegalPage, { H2, P, UL, BusinessBlock } from '@/components/LegalPage';

export default function ShippingPolicy() {
  return (
    <LegalPage title="Shipping &amp; Delivery Policy" subtitle="How Udaan24 AI Institute delivers its courses and services." updated="August 2026">
      <BusinessBlock />

      <P>Udaan24 AI Institute, operated by Udaan24 Educational Society, Kotkapura, provides <b>educational and training services</b>. We do not sell or ship any physical products. This policy explains how our services are delivered after a successful payment.</P>

      <H2>Service Delivery</H2>
      <UL>
        <li><b>Offline (classroom) courses</b> are delivered at our centre — Near Bus Stand, Kotkapura, Faridkot, Punjab — as per the batch schedule shared at the time of admission.</li>
        <li><b>Online / hybrid courses</b> are delivered digitally through our student portal, live/recorded classes, and downloadable study materials.</li>
        <li><b>Course access, login credentials, and study materials</b> are activated after your payment is confirmed — usually <b>immediately to within 24 hours</b> of successful payment.</li>
        <li><b>Certificates and marksheets</b> are issued digitally through the student portal upon successful completion of the course requirements.</li>
      </UL>

      <H2>No Physical Shipping</H2>
      <P>As we deliver educational services (not physical goods), there are no shipping charges, couriers, or delivery timelines for physical products. Any printed materials, if provided, are handed over at our centre.</P>

      <H2>Access Confirmation</H2>
      <P>After payment, you will receive your Student ID and login details. If you do not receive access within 24 hours of a successful payment, please contact us so we can activate it immediately.</P>

      <H2>Contact Us</H2>
      <P>For any questions about course access or delivery, contact Udaan24 AI Institute at info@udaan24.com or +91 97808 43440, Near Bus Stand, Kotkapura, Faridkot, Punjab 151204.</P>
    </LegalPage>
  );
}
