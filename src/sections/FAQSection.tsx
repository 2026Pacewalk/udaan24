import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'What is the admission process at Udaan24?',
    answer: 'The admission process is simple: Choose your AI course, fill the application form at our Kotkapura centre or online, submit required documents (ID proof, photographs), pay the registration fee, and start your classes. Our counselors in Kotkapura guide you through every step.',
  },
  {
    question: 'Do I need programming experience to join AI courses?',
    answer: 'Not at all! Our Python for AI course is designed for complete beginners. We start from the basics and gradually move to advanced AI concepts. Anyone with basic computer knowledge and interest in AI can join.',
  },
  {
    question: 'Do you provide placement assistance after course completion?',
    answer: 'Absolutely! We have a dedicated placement cell that helps with resume building, AI project portfolio, mock interviews, and connects you with companies hiring AI professionals. Our placement rate is over 90% for eligible students.',
  },
  {
    question: 'Can I pay the course fee in installments?',
    answer: 'Yes, we offer flexible payment options including monthly installments for all courses longer than 2 months. We also offer special discounts for group enrollments and early bird registrations at our Kotkapura centre.',
  },
  {
    question: 'Do you offer online AI classes for students outside Kotkapura?',
    answer: 'Yes! We offer live online AI classes with interactive sessions, recorded lectures, and dedicated doubt-clearing. Students from anywhere in Punjab and across India can join our online AI coaching programs.',
  },
  {
    question: 'What makes Udaan24 different from other institutes?',
    answer: 'Udaan24 is Punjab\'s first dedicated AI coaching institute. Unlike general IT training centres, we focus exclusively on AI, ML, and Data Science. Every course includes hands-on projects with real datasets, taught by AI industry professionals.',
  },
];

function FAQItem({ faq, isOpen, onClick }: { faq: FAQ; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-[#E8EDF5] last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className={`font-body text-[15px] font-medium transition-colors duration-200 pr-4 ${isOpen ? 'text-[#F5B800]' : 'text-[#1B2A4A] group-hover:text-[#F5B800]'}`}>
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#F5B800]' : 'text-[#718096]'}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[300px] pb-5' : 'max-h-0'}`}
      >
        <p className="text-[14px] text-[#4A5568] leading-relaxed pr-8">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding bg-white">
      <div className="container-main max-w-[800px]">
        <div className="text-center mb-14">
          <span className="label-meta mb-3 block">FAQ</span>
          <h2 className="font-display text-[36px] md:text-[42px] font-semibold text-[#1B2A4A] tracking-[-1.2px]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="bg-white border border-[#E8EDF5] rounded-2xl px-6 md:px-10">
          {faqs.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
