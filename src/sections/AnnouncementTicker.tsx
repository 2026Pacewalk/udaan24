const tickerText = "Admissions Open for AI Courses in Kotkapura \u2022 New Machine Learning Batch Starting Soon \u2022 Python for AI Course Enrolling Now \u2022 AI Coaching in Punjab - Udaan24 \u2022 Data Science Certification Course \u2022 Deep Learning with Live Projects \u2022 ";

export default function AnnouncementTicker() {
  return (
    <div className="w-full bg-[#FFF9E6] border-y border-[#E8EDF5] py-3 overflow-hidden">
      <div className="marquee-track whitespace-nowrap">
        <span className="font-body text-[13px] text-[#1B2A4A] font-medium tracking-wide px-4">
          {tickerText.repeat(4)}
        </span>
        <span className="font-body text-[13px] text-[#1B2A4A] font-medium tracking-wide px-4">
          {tickerText.repeat(4)}
        </span>
      </div>
    </div>
  );
}
