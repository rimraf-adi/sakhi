import Image from "next/image";
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  BookmarkCheck,
  Check,
  FileText,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import {
  COUPLE_MOMENTS,
  DATA_SOURCES,
  IMPACT_SIGNALS,
  NFHS_STATS,
} from "@/data/sakhi-content";

const FOUR_ACTIONS = [
  {
    name: "Alert",
    icon: ShieldAlert,
    summary:
      "When warning signs appear, or when anything feels uncertain, Sakhi tells her to go to the hospital now and alerts her ASHA worker and chosen family member.",
  },
  {
    name: "Save",
    icon: BookmarkCheck,
    summary:
      "Mild symptoms and missed iron tablets are saved with dates in her hospital record so nothing is forgotten between visits.",
  },
  {
    name: "Remind",
    icon: BellRing,
    summary:
      "Warm spoken reminders in her own language help her keep check-up dates and take daily iron tablets consistently.",
  },
  {
    name: "Summarize",
    icon: FileText,
    summary:
      "Before each visit, Sakhi reads her a short spoken recap and gives her doctor a dated, one-page timeline in her own words.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F7F4ED] text-[#0F181A]">
      {/* Keyboard Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-[#0F181A] focus:px-5 focus:py-2.5 focus:text-xs focus:font-semibold focus:text-[#F7F4ED] focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Section 0 & 1: Warm Light Editorial Header + Bento Hero */}
      <header className="bg-[#F7F4ED]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-6">
          <a
            href="#"
            className="inline-flex min-h-[44px] items-center gap-2.5 text-[#0F181A] transition-opacity duration-200 hover:opacity-80"
          >
            <span
              aria-hidden="true"
              className="inline-block h-3.5 w-3.5 rounded-full bg-gradient-to-br from-[#F3C9AC] to-[#D58E6D]"
            />
            <span translate="no" className="font-serif text-2xl font-semibold tracking-tight">
              Sakhi
            </span>
          </a>

          <div className="flex items-center gap-7">
            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-7 text-sm font-medium text-[#2A3332] md:flex"
            >
              <a
                href="#the-gap"
                className="py-2 transition-colors duration-200 hover:text-[#9C5A3C]"
              >
                Between Visits
              </a>
              <a
                href="#four-actions"
                className="py-2 transition-colors duration-200 hover:text-[#9C5A3C]"
              >
                4 Actions
              </a>
              <a
                href="#privacy"
                className="py-2 transition-colors duration-200 hover:text-[#9C5A3C]"
              >
                Privacy
              </a>
            </nav>

            <a
              href="#join"
              className="group inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-[#D58E6D] px-5 py-2.5 text-sm font-semibold text-white transition-[background-color,transform] duration-200 hover:bg-[#C37B59] active:scale-[0.985]"
            >
              Get Sakhi
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>
      </header>

      <section className="bg-[#F7F4ED] pt-4 pb-12 sm:pt-6 sm:pb-16 lg:pt-8 lg:pb-20">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Serif Headline + Copy + CTAs + Trust Points */}
            <div className="lg:col-span-6">
              <div className="animate-hero-rise" style={{ animationDelay: "60ms" }}>
                <p className="text-xs font-semibold tracking-[0.18em] text-[#9C5A3C] uppercase">
                  Voice-First Maternal Care · Android &amp; iOS
                </p>
                <h1 className="mt-4 font-serif text-4xl leading-[1.06] font-semibold tracking-[-0.02em] text-[#0F181A] sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem]">
                  She speaks.
                  <br />
                  Sakhi listens and acts.
                </h1>
              </div>

              <p
                className="animate-hero-rise mt-5 max-w-md text-base leading-relaxed text-[#3A4745] sm:text-lg"
                style={{ animationDelay: "140ms" }}
              >
                Between check-ups, you should not have to guess at 11 PM. Registered by your
                hospital, Sakhi listens in her own language and alerts her partner and care team
                within minutes.
              </p>

              <div
                className="animate-hero-rise mt-8 flex flex-wrap items-center gap-3.5"
                style={{ animationDelay: "220ms" }}
              >
                <a
                  href="#join"
                  className="group inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#D58E6D] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-[background-color,transform] duration-200 hover:bg-[#C37B59] active:scale-[0.985]"
                >
                  Get Sakhi
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </a>
                <a
                  href="#four-actions"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#0F181A]/35 bg-transparent px-7 py-3.5 text-sm font-medium text-[#0F181A] transition-[border-color,background-color,transform] duration-200 hover:border-[#0F181A]/65 hover:bg-[#0F181A]/[0.04] active:scale-[0.985]"
                >
                  See How It Works
                  <ArrowDown aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>

              <div
                className="animate-hero-rise mt-10 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-[#536360]"
                style={{ animationDelay: "280ms" }}
              >
                <span>Hospital registered</span>
                <span aria-hidden="true" className="hidden text-[#0F181A]/25 sm:inline">
                  ·
                </span>
                <span>Zero typing</span>
                <span aria-hidden="true" className="hidden text-[#0F181A]/25 sm:inline">
                  ·
                </span>
                <span>Partner stays informed</span>
              </div>
            </div>

            {/* Right Column: Veranda Illustration + Clinical Safety & Language Bento Tiles */}
            <div
              className="animate-hero-rise flex flex-col gap-4 lg:col-span-6"
              style={{ animationDelay: "160ms" }}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] border border-[#0F181A]/8 bg-[#EFE8DA] shadow-[0_20px_50px_-28px_rgba(15,24,26,0.18)]">
                <Image
                  src="/images/hero-bento-editorial.jpg"
                  alt="Warm editorial illustration of an expectant Indian mother seated peacefully by a sunlit arched veranda doorway holding her phone"
                  fill
                  priority
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col justify-between rounded-[22px] bg-[#A7CBB5] p-5 text-[#132C22]">
                  <p className="text-[13px] leading-snug font-medium">
                    Guided strictly by her pregnancy week, hospital visit dates, and{" "}
                    <strong className="font-semibold">
                      Ministry of Health danger-sign rules.
                    </strong>
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[#132C22]/15 pt-3.5 text-[11px] font-semibold">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                      Reviewed by Doctors
                    </span>
                    <span className="opacity-75">Never Diagnoses</span>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-[22px] bg-[#EDE6D6] p-5 text-[#0F181A]">
                  <div>
                    <p className="font-serif text-base font-semibold text-[#0F181A]">
                      Every home. Every language.
                    </p>
                    <p
                      aria-hidden="true"
                      className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1 text-xs font-medium text-[#536360]"
                    >
                      <span>नमस्ते</span>
                      <span>·</span>
                      <span>नमस्कार</span>
                      <span>·</span>
                      <span>வணக்கம்</span>
                      <span>·</span>
                      <span>ನಮಸ್ಕಾರ</span>
                      <span>·</span>
                      <span>নমস্কার</span>
                    </p>
                  </div>
                  <p className="mt-5 border-t border-[#0F181A]/12 pt-3.5 text-[11px] font-semibold text-[#536360]">
                    Zero typing. Zero menus. Android &amp; iOS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content">
        {/* Section 2: Relatable Couple Moments + NFHS-6 Scale Strip */}
        <section
          id="the-gap"
          className="border-b border-[#0F181A]/10 bg-[#F7F4ED] pt-12 pb-18 sm:pt-16 sm:pb-22"
        >
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="mb-14">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#D97745] uppercase">
                Between Visits
              </p>
              <h2 className="mt-2.5 font-serif text-3xl font-semibold tracking-tight text-[#0F181A] sm:text-4xl">
                Every pregnancy has quiet questions.
              </h2>

              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {COUPLE_MOMENTS.map((item, idx) => (
                  <Reveal
                    key={item.moment}
                    delayMs={idx * 90}
                    className={idx === 2 ? "md:col-span-2 lg:col-span-1" : ""}
                  >
                    <div className="h-full rounded-2xl border border-[#0F181A]/10 bg-[#FCFBF7] p-6 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-[#0F181A]/20 hover:shadow-sm">
                      <p className="text-[11px] font-bold tracking-[0.16em] text-[#9C4B22] uppercase">
                        {item.moment}
                      </p>
                      <p className="mt-3 font-serif text-lg leading-snug font-medium text-[#0F181A]">
                        {item.question}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-[#536360] sm:text-sm">
                        {item.answer}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal className="border-t border-[#0F181A]/10 pt-12">
              <p className="mb-8 text-xs font-semibold tracking-[0.18em] text-[#536360] uppercase">
                Across India, millions of families navigate these exact gaps
              </p>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
                {NFHS_STATS.map((stat, idx) => (
                  <div
                    key={stat.value}
                    className={`${
                      idx > 0 ? "lg:border-l lg:border-[#0F181A]/12 lg:pl-8" : ""
                    } ${idx < NFHS_STATS.length - 1 ? "lg:pr-8" : ""}`}
                  >
                    <p className="font-serif text-4xl font-semibold tracking-tight text-[#0F181A] tabular-nums sm:text-5xl">
                      {stat.value}
                    </p>
                    <p className="mt-2.5 text-sm font-semibold text-[#0F181A]">{stat.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#536360]">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delayMs={100} className="mx-auto mt-12 max-w-3xl border-t border-[#0F181A]/10 pt-10 text-center">
              <p className="font-serif text-xl leading-relaxed text-[#0F181A] sm:text-2xl">
                India still loses over 20,000 women a year in pregnancy and childbirth (88 per
                100,000 live births, SRS 2020-22). Sakhi cannot stop all of these deaths. It aims at
                one thing:{" "}
                <span className="text-[#D97745] underline decoration-[#D97745]/35 underline-offset-4">
                  the delay between a warning sign and care.
                </span>
              </p>
            </Reveal>
          </div>
        </section>

        {/* Section 4: Asymmetric Hairline Editorial */}
        <section
          id="four-actions"
          className="border-t border-[#0F181A]/10 bg-[#F7F4ED] py-14 sm:py-20 lg:py-26"
        >
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-0">
              <div className="border-b border-[#0F181A]/12 pb-8 lg:col-span-5 lg:border-r lg:border-b-0 lg:border-[#0F181A]/15 lg:pr-12 lg:pb-0">
                <div className="lg:sticky lg:top-16">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[#D97745] uppercase">
                    Safe by Design
                  </p>
                  <h2 className="mt-3 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-[#0F181A] sm:text-5xl">
                    Four clear ways
                    <br />
                    Sakhi helps.
                  </h2>
                  <div className="mt-5 h-px w-12 bg-[#0F181A]/35" />
                  <p className="mt-5 text-base leading-relaxed text-[#536360]">
                    Sakhi never diagnoses and never advises on medicine. It supports expectant
                    parents and doctors with four dependable steps, and nothing unverified.
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-[#536360]">
                    Every reply fits this woman, this week, and this symptom. It draws only from her
                    pregnancy week, earlier symptoms, hospital visit dates, and Ministry of Health
                    danger-sign guidelines.
                  </p>
                </div>
              </div>

              <div className="space-y-9 lg:col-span-7 lg:pl-14">
                {FOUR_ACTIONS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Reveal key={item.name} delayMs={idx * 70}>
                      <div className="group flex items-start gap-5">
                        <div
                          aria-hidden="true"
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0F181A] text-[#F7F4ED] shadow-sm transition-transform duration-300 group-hover:scale-105"
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-serif text-2xl font-semibold text-[#0F181A]">
                            {item.name}
                          </h3>
                          <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-[#536360] sm:text-base">
                            {item.summary}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Safety Guardrails & Doctor's One-Page Timeline */}
        <section className="border-t border-[#0F181A]/10 bg-[#EFE8DA]/65 py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-5">
                <p className="text-xs font-semibold tracking-[0.18em] text-[#D97745] uppercase">
                  Before Every Check-Up
                </p>
                <h2 className="mt-3 font-serif text-3xl leading-[1.12] font-semibold tracking-tight sm:text-4xl">
                  Walk in heard, not rushed.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#536360] sm:text-base">
                  Her doctor gets a dated one-page history in her own words before she enters.
                </p>

                <ul className="mt-6 space-y-3 text-sm text-[#0F181A]">
                  {[
                    "Repeats back in her language to confirm",
                    "Escalates to ASHA or hospital whenever unsure",
                    "Tested with doctors across regional phrasing",
                  ].map((point) => (
                    <li key={point} className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2B7A5B]/15 text-[#2B7A5B]"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Reveal delayMs={90} className="lg:col-span-7">
                <div className="rounded-[24px] border border-[#0F181A]/10 bg-[#FCFBF7] p-6 shadow-[0_20px_50px_-24px_rgba(15,24,26,0.16)] sm:p-8">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#0F181A]/10 pb-4">
                    <div>
                      <h3 className="font-serif text-xl font-semibold text-[#0F181A] sm:text-2xl">
                        One-Page Timeline
                      </h3>
                      <p className="mt-1.5 text-xs text-[#536360] tabular-nums">
                        Week 32 · Iron 24/28 days · Hindi
                      </p>
                    </div>
                    <span className="text-xs font-medium text-[#536360] tabular-nums">
                      ANC Visit #3
                    </span>
                  </div>

                  <div className="mt-6 space-y-5 border-l border-[#0F181A]/15 pl-5">
                    <div>
                      <p className="text-[11px] font-semibold tracking-wider uppercase">
                        <span className="text-[#C23B2B]">19 Nov · Alert Sent</span>{" "}
                        <span className="font-medium text-[#2B7A5B] normal-case">
                          · Reached hospital in 38m
                        </span>
                      </p>
                      <p className="mt-1.5 font-serif text-base font-medium text-[#0F181A] sm:text-lg">
                        “Do din se sar dard hai aur pair sujhe hue hain.”
                      </p>
                      <p className="mt-1 text-xs text-[#536360]">
                        Headache, swelling &amp; blurred vision · Confirmed by repeat-back
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold tracking-wider text-[#536360] uppercase">
                        14 Nov · Saved &amp; Reminded
                      </p>
                      <p className="mt-1.5 font-serif text-base font-medium text-[#0F181A] sm:text-lg">
                        “Kal raat iron ki goli lena bhool gayi.”
                      </p>
                      <p className="mt-1 text-xs text-[#536360]">
                        Missed iron tablet · Evening voice reminder scheduled
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Section 6: Three Baseline-First Impact Signals */}
        <section id="impact" className="bg-[#F7F4ED] py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#D97745] uppercase">
                Measured Against Baseline
              </p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                Three signals we track from day one
              </h2>
              <p className="mt-3 text-base text-[#536360]">
                We measure each hospital’s baseline first, so we can show real change and not just
                a final number.
              </p>
            </div>

            <div className="mt-12 grid gap-10 border-t border-[#0F181A]/12 pt-10 md:grid-cols-3">
              {IMPACT_SIGNALS.map((signal, idx) => (
                <Reveal key={signal.pillar} delayMs={idx * 80}>
                  <p className="text-xs font-bold tracking-[0.16em] text-[#D97745] uppercase">
                    {signal.pillar}
                  </p>
                  <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#0F181A] tabular-nums sm:text-5xl">
                    {signal.metric}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#536360]">{signal.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Privacy Manifesto & Closing How-to-Join Vista */}
        <section id="privacy" className="pb-10 sm:pb-14">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
            <div
              id="join"
              className="relative overflow-hidden rounded-[32px] border border-[#0F181A]/12 bg-[#F6D8B2] shadow-[0_30px_80px_-32px_rgba(15,24,26,0.22)]"
            >
              <Image
                src="/images/closing-dawn-water.jpg"
                alt="Warm morning apricot sky over distant sage-teal hills and a calm sunlit river"
                fill
                className="object-cover object-bottom"
                sizes="(max-width: 1240px) 100vw, 1240px"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#F6D8B2]/82 via-[#F6D8B2]/55 via-58% to-transparent" />

              <div className="relative z-10 flex flex-col items-center px-5 pt-12 pb-28 text-center sm:px-10 sm:pt-16 sm:pb-40 lg:px-12 lg:pb-48">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#0F181A]/20 bg-[#FAF6EE]/75 px-4 py-1.5 text-xs font-semibold text-[#0F181A] backdrop-blur-sm">
                  <Lock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  Hospital-Owned · Private by Design
                </div>

                <h2 className="mt-5 max-w-2xl font-serif text-3xl leading-[1.08] font-semibold tracking-tight text-[#0F181A] sm:text-5xl">
                  Private at home. Connected to your hospital.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#0F181A]/90 sm:text-base">
                  Your record stays strictly with your hospital. We never sell data or share it with
                  private companies. Government health professionals and public-health researchers
                  only see grouped data with no names, and only with your consent.
                </p>

                <div className="mt-6 max-w-xl rounded-2xl border border-[#0F181A]/15 bg-[#FAF6EE]/80 px-5 py-3.5 text-xs leading-relaxed text-[#0F181A] backdrop-blur-sm sm:text-sm">
                  <span className="font-semibold">How your family starts:</span> Ask your hospital
                  or OB-GYN to add you at your next visit. Setup takes 60 seconds on Android or iOS,
                  with no passwords and no forms.
                </div>

                <div className="mt-7 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3.5">
                  <a
                    href="mailto:pilot@sakhihealth.in?subject=Bring%20Sakhi%20to%20Our%20Hospital"
                    className="group inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#0F181A] px-7 py-3.5 text-xs font-semibold tracking-wider text-[#F7F4ED] uppercase shadow-sm transition-[background-color,transform] duration-200 hover:bg-[#1E3A56] active:scale-[0.985] sm:w-auto"
                  >
                    Bring Sakhi to Your Hospital
                    <ArrowRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </a>
                  <a
                    href="#four-actions"
                    className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-[#0F181A]/35 bg-[#FAF6EE]/85 px-7 py-3.5 text-xs font-semibold tracking-wider text-[#0F181A] uppercase backdrop-blur-sm transition-[background-color,transform] duration-200 hover:bg-white active:scale-[0.985] sm:w-auto"
                  >
                    See How Sakhi Helps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sources & Notes */}
        <section
          aria-labelledby="sources-heading"
          className="mx-auto max-w-[1240px] px-5 pb-10 sm:px-8"
        >
          <div className="border-t border-[#0F181A]/10 pt-8">
            <h2
              id="sources-heading"
              className="text-[11px] font-semibold tracking-[0.16em] text-[#536360] uppercase"
            >
              Sources &amp; Notes
            </h2>
            <ol className="mt-4 grid gap-x-8 gap-y-3 text-xs leading-relaxed text-[#536360] md:grid-cols-2">
              {DATA_SOURCES.map((source) => (
                <li key={source.claim}>
                  <span className="font-medium text-[#0F181A]">{source.claim}:</span>{" "}
                  {source.citation}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-2.5 px-5 pb-10 text-center text-xs text-[#536360] sm:flex-row sm:px-8 sm:text-left">
        <p className="font-medium text-[#0F181A]">
          <span translate="no">Sakhi</span> · Voice-first maternal care companion for India
        </p>
        <p>Cities, towns &amp; villages · Android &amp; iOS · Hospital-owned records</p>
      </footer>
    </div>
  );
}
