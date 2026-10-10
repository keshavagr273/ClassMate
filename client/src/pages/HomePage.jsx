import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpenCheck,
  Briefcase,
  CalendarDays,
  CalendarRange,
  CreditCard,
  Phone,
  SearchCheck,
  Share2,
  ShoppingBag,
  Table2,
} from "lucide-react";
import FeatureCard from "../components/HomePage/FeatureCard";
import SpotlightCard from "../components/SpotlightCard";
import HeroSection from "../components/HeroSection";
import { Button, Card, Eyebrow, SectionHeader } from "../components/ui";

import chatImage from "../public/assets/images/chat.jpg";
import hackathonImage from "../public/assets/images/hackathon.jpeg";
import festImage from "../public/assets/images/fest.jpeg";
import workshopImage from "../public/assets/images/workshop.jpg";
import debateImage from "../public/assets/images/debate.jpg";

const featureModules = [
  {
    icon: BookOpenCheck,
    title: "SkillSwap",
    accent: "skill",
    description:
      "Teach what you know, learn what you want. Get matched with peers by skill.",
    href: "/skill-exchange",
  },
  {
    icon: Briefcase,
    title: "JobConnect",
    accent: "jobs",
    // The route is /job-connect. This card used to point at /intern-connect,
    // which has never existed, so the link was dead.
    description:
      "Internships pulled from trusted boards, filtered to what you can actually apply for.",
    href: "/job-connect",
  },
  {
    icon: CalendarDays,
    title: "ClassPulse",
    accent: "pulse",
    description:
      "Track attendance per subject and see where you stand against the 75% line.",
    href: "/attendance",
  },
  {
    icon: ShoppingBag,
    title: "CampusBazaar",
    accent: "bazaar",
    description:
      "Buy and sell within campus. Books, cycles, electronics, from people you can find.",
    href: "/marketplace",
  },
  {
    icon: SearchCheck,
    title: "FoundIt!",
    accent: "found",
    description:
      "Report something lost, or post what you found. Most things turn up within a day.",
    href: "/lost-found",
  },
  {
    icon: Share2,
    title: "RideLoop",
    accent: "ride",
    description:
      "Share a cab to the station or the airport. Split the fare, cut the wait.",
    href: "/rides",
  },
];

const quickLinks = [
  { icon: CalendarRange, label: "Academic calendar", href: "/calendar.pdf" },
  { icon: Table2, label: "Exam timetable", href: "/timetable.pdf" },
  { icon: Phone, label: "Important contacts", href: "/contact.pdf" },
  {
    icon: CreditCard,
    label: "Fee payment",
    href: "https://www.onlinesbi.sbi/sbicollect/",
  },
];

const events = [
  {
    image: festImage,
    title: "Agnito 2026",
    description: "The flagship fest — culture, tech and everything between.",
  },
  {
    image: workshopImage,
    title: "AI Workshop",
    description: "Hands-on sessions building and shipping small models.",
  },
  {
    image: debateImage,
    title: "Inter-College Debate",
    description: "Teams from across the region, two days of rounds.",
  },
];

const spotlightData = [
  {
    image: chatImage,
    title: "Meet Aryan",
    subtitle: "Campus chat app",
    description:
      "Built a real-time chat app now used by more than 300 students on campus.",
    link: "/spotlight/aryan",
  },
  {
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    title: "Sanya's research paper",
    subtitle: "Published in IEEE Xplore",
    description:
      "Work on AI-assisted healthcare diagnostics, accepted at an international journal.",
    link: "/spotlight/sanya-paper",
  },
  {
    image: hackathonImage,
    title: "IEEE Hackathon 2025",
    subtitle: "First place",
    description:
      "A team of four won with an IoT-based campus safety alert system.",
    link: "/spotlight/ieee-2025",
  },
];

const HomePage = () => {
  const toolsRef = useRef(null);

  const scrollToTools = () =>
    toolsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="flex flex-col">
      <HeroSection onExploreClick={scrollToTools} />

      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10">
        {/* Tools. A real responsive grid — this used to be a horizontal
            drag-scroll rail that hid four of the six tools on first load. */}
        <section ref={toolsRef} className="scroll-mt-20 py-16 md:py-24">
          <SectionHeader
            eyebrow="Six tools"
            title="Everything campus life needs"
            description="Each one solves a problem students were already solving over WhatsApp."
            size="h2"
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureModules.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-line py-16 md:py-24">
          <SectionHeader
            eyebrow="How it works"
            title="Three steps, then you're in"
            size="h2"
          />
          <ol className="mt-10 grid gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
            {[
              [
                "Sign in once",
                "Use your institute email. One account covers every tool — no separate logins, no approvals to wait on.",
              ],
              [
                "Pick your tools",
                "Enroll in your subjects, list what you're selling, post a ride. Each tool works on its own.",
              ],
              [
                "Stay in the loop",
                "Notifications reach you when someone claims your listing, joins your ride or replies to a swap.",
              ],
            ].map(([title, body], i) => (
              <li key={title} className="bg-surface p-6">
                <span className="numeric font-display text-h2 font-bold text-line-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-h4 text-ink">{title}</h3>
                <p className="mt-2 text-meta text-ink-3">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Quick links */}
        <section className="border-t border-line py-16 md:py-24">
          <SectionHeader eyebrow="Shortcuts" title="Campus documents" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map(({ icon: Icon, label, href }) => (
              <Card
                key={label}
                as="a"
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                interactive
                className="group flex items-center gap-4"
              >
                <Icon
                  className="size-5 shrink-0 text-ink-4 transition-colors duration-200 group-hover:text-accent"
                  aria-hidden
                />
                <span className="text-ui font-medium text-ink">{label}</span>
              </Card>
            ))}
          </div>
        </section>

        {/* Campus buzz */}
        <section className="border-t border-line py-16 md:py-24">
          <SectionHeader eyebrow="What's on" title="Campus buzz" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article key={event.title} className="group flex flex-col gap-4">
                <div className="aspect-[4/3] overflow-hidden rounded-card border border-line bg-surface-2">
                  <img
                    src={event.image}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 ease-standard group-hover:scale-[1.03]"
                  />
                </div>
                <div>
                  <h3 className="text-h4 text-ink">{event.title}</h3>
                  <p className="mt-1 text-meta text-ink-3">
                    {event.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Spotlights */}
        <section className="border-t border-line py-16 md:py-24">
          <SectionHeader
            eyebrow="People"
            title="Student spotlights"
            description="Work being done by people you share a mess hall with."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spotlightData.map((item) => (
              <SpotlightCard key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="border-t border-line py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <Eyebrow>Built on campus</Eyebrow>
              <h2 className="mt-4 text-h2 text-ink">
                Made by students who were tired of WhatsApp groups.
              </h2>
              <p className="mt-4 max-w-xl text-body text-ink-3">
                ClassMate is maintained by students at IIIT Sonepat. If
                something is broken or missing, it is usually because nobody has
                asked for it yet — so ask.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:col-span-5 lg:justify-end">
              <Button as={Link} to="/login" size="lg">
                Get started
              </Button>
              <Button
                as="a"
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="lg"
                trailingIcon={ArrowUpRight}
              >
                Contribute
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
