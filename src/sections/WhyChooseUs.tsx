import { Users, Award, FileCheck, Monitor, Wallet, Headphones } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'AI Industry Experts',
    description: 'Learn from certified AI professionals with real-world experience in Machine Learning, Deep Learning, and Data Science. Our trainers have worked on production AI systems at leading companies.',
    large: true,
  },
  {
    icon: Award,
    title: 'Live AI Projects',
    description: 'Every course includes hands-on projects with real datasets. Build your AI portfolio with projects in NLP, computer vision, predictive analytics and chatbot development.',
    large: false,
  },
  {
    icon: FileCheck,
    title: 'Industry-Recognized Certificate',
    description: 'Earn a Udaan24 certificate valued by employers. Show your AI skills with a verified credential backed by live projects.',
    large: false,
  },
  {
    icon: Monitor,
    title: 'Online & Offline Classes',
    description: 'Join in-person classes at our Kotkapura center or attend live online sessions from anywhere in Punjab.',
    large: false,
  },
  {
    icon: Wallet,
    title: 'Affordable AI Education',
    description: 'Learn AI without breaking the bank. Pocket-friendly fees starting from just Rs. 5,000. EMI options and group discounts available for Kotkapura students.',
    large: true,
  },
  {
    icon: Headphones,
    title: 'Lifetime Support',
    description: 'Get lifetime access to course materials, AI community, doubt-clearing sessions, and career guidance even after course completion.',
    large: false,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section-padding bg-[#FEFDFB]">
      <div className="container-main">
        <div className="text-center mb-14">
          <span className="label-meta mb-3 block">Why Udaan24</span>
          <h2 className="font-display text-[36px] md:text-[42px] font-semibold text-[#1B2A4A] tracking-[-1.2px]">
            Punjab's Trusted AI Coaching
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`card-standard group ${feature.large ? 'md:col-span-2 lg:col-span-2' : ''}`}
            >
              <div className="w-12 h-12 rounded-lg bg-[#FFF9E6] flex items-center justify-center mb-4 group-hover:bg-[#F5B800] transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-[#F5B800] group-hover:text-[#1B2A4A] transition-colors duration-300" />
              </div>
              <h3 className="font-body text-[20px] font-semibold text-[#1B2A4A] mb-2">
                {feature.title}
              </h3>
              <p className="text-[14px] text-[#4A5568] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
