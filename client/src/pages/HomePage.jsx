import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import FeatureCard from "../components/HomePage/FeatureCard";
import {
  BookOpenCheck,
  CalendarDays,
  DollarSign,
  SearchCheck,
  Share2,
  MessageSquareText,
  Briefcase,
} from "lucide-react";
import SpotlightCard from "../components/SpotlightCard";
import { motion } from "framer-motion";
import HeroSection from "../components/HeroSection";

// Import images properly for both development and production
import chatImage from "../public/assets/images/chat.jpg";
import hackathonImage from "../public/assets/images/hackathon.jpeg";
import festImage from "../public/assets/images/fest.jpeg";
import workshopImage from "../public/assets/images/workshop.jpg";
import debateImage from "../public/assets/images/debate.jpg";

const userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuB_Iw_su29HvXm8ug2L3NHlXyZ8GNbmTmgy0QQ6dgNbO2GvTy16jLFLsNS0Q0KTcNdb7TG_42wl0VUbou8Ya4L8gj6po2gqqBvSmC4kIkqb7RmpKoN88Y7gf2uLxNCsw6MOndWfHGC8lUnJ0iszvw5DxmqzqCYQgYSX20a2uzx4OYCHpQjbCsqY7T_Nl-5y2pbxwCsQ42uk29-KCmzm_aKmPLYq3Dwu94G3ACiyPXtUJUi4ZAfwzMrmiwbNzCl1nEc3KD9kdcPAxfA";

const featureModules = [
  {
    icon: BookOpenCheck,
    title: "SkillSwap",
    description: "Teach what you know, learn what you want. Connect with peers for skill sharing.",
    href: "/skill-exchange",
    gradient: "from-teal-500 via-emerald-600 to-green-700",
  },
  {
    icon: Briefcase,
    title: "InternConnect",
    description: "Get matched with top internships from trusted platforms like Internshala.",
    href: "/intern-connect",
    gradient: "from-blue-500 via-sky-500 to-indigo-600", // 💼 professional blue
  },
  {
    icon: CalendarDays,
    title: "ClassPulse",
    description: "Track your class attendance effortlessly and stay up to date.",
    href: "/attendance",
    gradient: "from-indigo-600 via-indigo-700 to-blue-900",
  },
  {
    icon: DollarSign,
    title: "CampusBazaar",
    description: "Buy and sell anything within the campus. Safe & trusted.",
    href: "/marketplace",
    gradient: "from-yellow-600 via-orange-600 to-pink-700",
  },
  {
    icon: SearchCheck,
    title: "FoundIt!",
    description: "Report lost items or find what others found nearby.",
    href: "/lost-found",
    gradient: "from-orange-500 via-pink-600 to-red-600", // 🔥 bright alerting colors
  },
  {
    icon: Share2,
    title: "RideLoop",
    description: "Smart carpooling with your college peers. Eco & social.",
    href: "/rides",
    gradient: "from-emerald-500 via-teal-500 to-blue-600", // 🌿 fresh and friendly
  }
];


const spotlightData = [
  {
    image: chatImage,
    title: "Meet Aryan",
    subtitle: "Built a Campus Chat App from Scratch",
    description: "Aryan created a real-time chat app used by 300+ students in IIIT Sonepat.",
    link: "/spotlight/aryan"
  },
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    title: "Sanya's Research Paper",
    subtitle: "Published in IEEE Xplore",
    description: "Sanya's work on AI-powered healthcare was published in a top international journal.",
    link: "/spotlight/sanya-paper"
  },
  {
    image: hackathonImage,
    title: "IEEE Hackathon – 2025",
    subtitle: "Winners: Smart Campus Automation",
    description: "Team of 4 won 1st place by building IoT-based smart alert system for campus safety.",
    link: "/spotlight/ieee-2025"
  }
];

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const sliderRef = useRef(null);
  const toolsRef = useRef(null);

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  };

  const scrollToTools = () => {
    toolsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 flex flex-col">
      {/* <NavBar /> */}
      <div className="layout-container flex h-full grow flex-col">
        {/* Main Content */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <HeroSection onExploreClick={scrollToTools} />
            {/* Key Features */}
            <div ref={toolsRef} className="flex justify-between items-center px-4 pt-5">
              <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">ClassMate Tools</h2>
              <button
                onClick={scrollRight}
                className="text-white bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded-md"
              >
                ➡ Slide
              </button>
            </div>
            <div
              ref={sliderRef}
              className="flex overflow-x-auto gap-4 px-4 py-3 scroll-smooth no-scrollbar"
            >
              {featureModules.map((feature, index) => (
                <div
                  key={index}
                  className="min-w-[280px] transition-transform transform hover:scale-105 snap-start"
                >
                  <FeatureCard {...feature} />
                </div>
              ))}
            </div>
            {/* Quick Links */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Quick Links</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5 p-4">
              <a href="/calendar.pdf" target="_blank" rel="noopener noreferrer" className="flex flex-1 gap-4 rounded-xl border border-[#314d68] bg-[#182634] p-6 items-center min-h-[80px] shadow-lg hover:bg-[#22344a] transition">
                {/* Calendar Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="36px" height="36px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z"></path>
                </svg>
                <h2 className="text-white text-xl font-bold leading-tight">Academic Calendar</h2>
              </a>
              <a href="/contact.pdf" target="_blank" rel="noopener noreferrer" className="flex flex-1 gap-4 rounded-xl border border-[#314d68] bg-[#182634] p-6 items-center min-h-[80px] shadow-lg hover:bg-[#22344a] transition">
                {/* Phone Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="36px" height="36px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"></path>
                </svg>
                <h2 className="text-white text-xl font-bold leading-tight">Important Contacts</h2>
              </a>
              <a href="https://www.onlinesbi.sbi/sbicollect/" target="_blank" rel="noopener noreferrer" className="flex flex-1 gap-4 rounded-xl border border-[#314d68] bg-[#182634] p-6 items-center min-h-[80px] shadow-lg hover:bg-[#22344a] transition">
                {/* Credit Card Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="36px" height="36px" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2"/>
                  <rect x="6" y="15" width="4" height="2" rx="1" fill="currentColor" />
                </svg>
                <h2 className="text-white text-xl font-bold leading-tight">Payment Portal</h2>
              </a>
              <a href="/timetable.pdf" target="_blank" rel="noopener noreferrer" className="flex flex-1 gap-4 rounded-xl border border-[#314d68] bg-[#182634] p-6 items-center min-h-[80px] shadow-lg hover:bg-[#22344a] transition">
                {/* Timetable Icon */}
                <svg xmlns="http://www.w3.org/2000/svg" width="36px" height="36px" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="8" x2="21" y2="8" stroke="currentColor" strokeWidth="2"/>
                  <rect x="7" y="12" width="2" height="2" fill="currentColor" />
                  <rect x="11" y="12" width="2" height="2" fill="currentColor" />
                  <rect x="15" y="12" width="2" height="2" fill="currentColor" />
                </svg>
                <h2 className="text-white text-xl font-bold leading-tight">Exam Timetable</h2>
              </a>
            </div>
            {/* Campus Buzz */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Campus Buzz</h2>
            <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-stretch p-4 gap-3">
                {/* Event Card: Agnito 2026 */}
                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40">
                  <div
                    className="w-full bg-center bg-no-repeat bg-cover rounded-lg flex flex-col"
                    style={{ aspectRatio: '4/3', height: '180px', backgroundImage: `url(${festImage})` }}
                  ></div>
                  <div>
                    <p className="text-white text-lg md:text-2xl font-bold leading-tight">Agnito 2026</p>
                    <p className="text-[#90adcb] text-base md:text-lg font-semibold leading-normal">Flagship fest of IIIT Sonepat – culture, tech & fun combined!</p>
                  </div>
                </div>

                {/* Event Card: AI Workshop */}
                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40">
                  <div
                    className="w-full bg-center bg-no-repeat bg-cover rounded-lg flex flex-col"
                    style={{ aspectRatio: '4/3', height: '180px', backgroundImage: `url(${workshopImage})` }}
                  ></div>
                  <div>
                    <p className="text-white text-lg md:text-2xl font-bold leading-tight">AI Workshop</p>
                    <p className="text-[#90adcb] text-base md:text-lg font-semibold leading-normal">Dive into hands-on projects in the world of artificial intelligence.</p>
                  </div>
                </div>

                {/* Event Card: Debate Competition */}
                <div className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40">
                  <div
                    className="w-full bg-center bg-no-repeat bg-cover rounded-lg flex flex-col"
                    style={{ aspectRatio: '4/3', height: '180px', backgroundImage: `url(${debateImage})` }}
                  ></div>
                  <div>
                    <p className="text-white text-lg md:text-2xl font-bold leading-tight">Inter-College Debate Competition</p>
                    <p className="text-[#90adcb] text-base md:text-lg font-semibold leading-normal">Engage in a thrilling debate with students from top colleges.</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Student Achievements & Spotlights */}
            <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5"> Student Spotlights</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-8">
              {spotlightData.map((item, index) => (
                <SpotlightCard key={index} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

