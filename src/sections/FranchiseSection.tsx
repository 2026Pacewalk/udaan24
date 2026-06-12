import { Link } from 'react-router';
import { ArrowRight, TrendingUp, Shield, Users, Award, MapPin, Phone } from 'lucide-react';

const benefits = [
  { icon: TrendingUp, title: 'High ROI', desc: 'Recover investment within 4-6 months' },
  { icon: Shield, title: 'Low Investment', desc: 'Start from just Rs. 1.5 Lakhs' },
  { icon: Users, title: 'Complete Support', desc: 'Curriculum, marketing & training' },
  { icon: Award, title: 'Brand Recognition', desc: 'Punjab\'s trusted AI coaching brand' },
];

export default function FranchiseSection() {
  return (
    <section className="section-padding bg-[#1B2A4A]">
      <div className="container-main">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <span className="font-mono-accent text-[12px] tracking-[0.1em] text-[#F5B800] uppercase mb-4 block">
              Partner With Us
            </span>
            <h2 className="font-display text-[36px] md:text-[48px] font-semibold text-white leading-[1.1] tracking-[-1.5px] mb-6">
              Start Your Own<br />AI Study Centre
            </h2>
            <p className="text-[16px] text-white/70 leading-relaxed mb-8">
              Join Udaan24 and bring AI education to your city. We provide complete support including AI curriculum, 
              faculty training, marketing materials, student management tools, and ongoing operational guidance 
              to make your centre successful in Punjab.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(245,184,0,0.15)] flex items-center justify-center flex-shrink-0">
                    <b.icon className="w-5 h-5 text-[#F5B800]" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-semibold text-white mb-0.5">{b.title}</h4>
                    <p className="text-[13px] text-white/50">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/franchise" className="btn-primary inline-flex items-center justify-center gap-2">
                Apply for Study Centre
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="tel:+919876543210"
                className="flex items-center justify-center gap-2 text-white/70 hover:text-[#F5B800] transition-colors text-[14px] font-medium border border-white/20 rounded-full px-8 py-3.5"
              >
                <Phone className="w-4 h-4" />
                Call: +91 97808 43440
              </a>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=500&fit=crop"
                alt="Training Center"
                className="w-full h-[400px] md:h-[500px] object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A4A]/80 to-transparent" />
            </div>

            {/* Floating Stats */}
            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/10">
                <div className="font-display text-[22px] font-semibold text-[#F5B800]">2,000+</div>
                <div className="text-[11px] text-white/60 uppercase tracking-wider">AI Students</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/10">
                <div className="font-display text-[22px] font-semibold text-[#F5B800]">15+</div>
                <div className="text-[11px] text-white/60 uppercase tracking-wider">AI Courses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/10">
                <div className="font-display text-[22px] font-semibold text-[#F5B800]">98%</div>
                <div className="text-[11px] text-white/60 uppercase tracking-wider">Placement</div>
              </div>
            </div>

            {/* Location Pin */}
            <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2.5 border border-white/10 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F5B800]" />
              <span className="text-[12px] text-white font-medium">Now in Punjab</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
