import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  course: string;
  content: string;
  rating: number;
  photo: string;
}

const testimonials: Testimonial[] = [
  {
    name: 'Priya Sharma',
    course: 'Machine Learning Masterclass',
    content: 'Udaan24\'s ML course was a game-changer. I went from zero coding knowledge to building my own prediction models in just 4 months. The hands-on projects and patient mentors at the Kotkapura center made all the difference. Now I work as a Data Analyst at a tech company.',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Rahul Verma',
    course: 'Full Stack AI Developer',
    content: 'The Full Stack AI Developer course at Udaan24 is worth every penny. I learned Python, Machine Learning, Deep Learning and even deployed my own models. The faculty in Kotkapura is incredibly knowledgeable and always available for doubts.',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Anjali Patel',
    course: 'Data Science with Python',
    content: 'I joined Udaan24 after my graduation and it was the best decision. The Data Science course covered everything from statistics to predictive modeling. The real-world projects in the curriculum helped me crack interviews at 3 companies. Highly recommended!',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Mohit Gupta',
    course: 'Deep Learning & Neural Networks',
    content: 'The Deep Learning course at Udaan24 is world-class. We built CNNs for image recognition and RNNs for text processing from scratch. The trainers explain complex neural network concepts in such simple terms. I am now working as an AI Engineer remotely.',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
  },
  {
    name: 'Sneha Reddy',
    course: 'NLP & AI Prompt Engineering',
    content: 'Udaan24\'s NLP course helped me transition from a content writer to an AI Product Developer. Learning GPT integration and prompt engineering opened up entirely new career opportunities. The Kotkapura center has excellent lab facilities.',
    rating: 5,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="section-padding bg-white">
      <div className="container-main">
        <div className="text-center mb-14">
          <span className="label-meta mb-3 block">Testimonials</span>
          <h2 className="font-display text-[36px] md:text-[42px] font-semibold text-[#1B2A4A] tracking-[-1.2px]">
            What Our Students Say
          </h2>
        </div>

        <div className="max-w-[800px] mx-auto relative">
          {/* Quote Icon */}
          <div className="absolute -top-4 left-0 md:-left-8">
            <Quote className="w-12 h-12 text-[#F5B800] opacity-30" />
          </div>

          <div className="bg-white border border-[#E8EDF5] rounded-2xl p-8 md:p-12 relative overflow-hidden">
            <div className="flex items-center gap-1 mb-6">
              {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                <Star key={i} className="w-5 h-5 text-[#F5B800] fill-[#F5B800]" />
              ))}
            </div>

            <p className="text-[16px] md:text-[18px] text-[#4A5568] leading-relaxed mb-8 font-body">
              "{testimonials[current].content}"
            </p>

            <div className="flex items-center gap-4">
              <img
                src={testimonials[current].photo}
                alt={testimonials[current].name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#F5B800]"
              />
              <div>
                <h4 className="font-body text-[16px] font-semibold text-[#1B2A4A]">
                  {testimonials[current].name}
                </h4>
                <p className="text-[13px] text-[#718096]">
                  {testimonials[current].course} Student
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 mt-8">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-full border border-[#E8EDF5] flex items-center justify-center hover:bg-[#E8EDF5] transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#718096]" />
              </button>
              <div className="flex items-center gap-1.5 mx-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      i === current ? 'w-6 bg-[#F5B800]' : 'bg-[#E8EDF5]'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-10 h-10 rounded-full border border-[#E8EDF5] flex items-center justify-center hover:bg-[#E8EDF5] transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#718096]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
