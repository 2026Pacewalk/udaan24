import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/919780843440"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-[#25D366] rounded-full shadow-[0_4px_16px_rgba(37,211,102,0.4)] flex items-center justify-center hover:scale-110 transition-transform duration-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-white" />
    </a>
  );
}
