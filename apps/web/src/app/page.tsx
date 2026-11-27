import Image from "next/image";
import {
  ArrowRight,
  BellRing,
  BookmarkCheck,
  Check,
  FileText,
  Lock,
  Play,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { OrbShowcase } from "@/components/OrbShowcase";
import {
  COUPLE_MOMENTS,
  GUARDRAILS,
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

      {/* Section 0 & 1: Floating 3-Island Nav + Twilight Horizon Hero */}
      <section className="relative min-h-[660px] w-full overflow-hidden bg-[#13263E] lg:min-h-[740px]">
        <Image
          src="/images/hero-twilight-horizon.jpg"
          alt="Calm twilight sky over distant hills and warm golden light reflected on still water"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101E2E]/82 via-[#162B44]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F181A]/45 via-transparent to-[#13263E]/35" />

        {/* Section 0: Three Floating White Pill Islands */}
        <header className="relative z-20 mx-auto max-w-6xl px-5 pt-6 sm:px-8">
          <div className="flex items-center justify-between gap-3">
            <a
              href="#"
              className="inline-flex min-h-[44px] items-center gap-2.5 rounded-full bg-white px-4 py-2 text-[#0F181A] shadow-[0_8px_24px_rgba(15,24,26,0.18)] transition-transform hover:scale-[1.02]"
            >
              <span
                aria-hidden="true"
                className="inline-block h-3.5 w-3.5 rounded-full shadow-[0_0_10px_rgba(217,119,69,0.55)]"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #fff0d4 0%, #f6c478 45%, #d97745 90%)",
                }}
              />
              <span translate="no" className="font-serif text-base font-semibold tracking-tight">
                Sakhi
              </span>
            </a>

            <nav
              aria-label="Primary navigation"
              className="hidden min-h-[44px] items-center gap-6 rounded-full bg-white px-7 py-2.5 text-xs font-medium text-[#0F181A]/85 shadow-[0_8px_24px_rgba(15,24,26,0.18)] md:flex"
            >
              <a href="#the-gap" className="py-1 transition-colors hover:text-[#D97745]">
                The Gap
              </a>
              <a href="#hear-sakhi" className="py-1 transition-colors hover:text-[#D97745]">
                Hear Sakhi
              </a>
              <a href="#four-actions" className="py-1 transition-colors hover:text-[#D97745]">
                4 Actions
              </a>
              <a href="#impact" className="py-1 transition-colors hover:text-[#D97745]">
                Impact
              </a>
              <a href="#privacy" className="py-1 transition-colors hover:text-[#D97745]">
                Privacy
              </a>
            </nav>

            <a
              href="#join"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-xs font-semibold text-[#0F181A] shadow-[0_8px_24px_rgba(15,24,26,0.18)] transition-colors hover:bg-[#F5D6AE]"
            >
              Get Sakhi
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>

        {/* Hero Foreground Content */}
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col justify-between gap-10 px-5 pt-14 pb-16 sm:px-8 lg:min-h-[650px] lg:flex-row lg:items-end lg:pt-18 lg:pb-18">
          <div className="max-w-2xl pb-2 lg:pb-6">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#F6C478] uppercase">
              Voice-First Maternal Care · Android &amp; iOS
            </p>
            <h1 className="mt-4 font-serif text-4xl leading-[1.06] font-semibold tracking-[-0.02em] text-white sm:text-5xl lg:text-[3.4rem]">
              She speaks.
              <br />
              <span className="lg:whitespace-nowrap">Sakhi listens and acts.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/90 sm:text-lg">
              Between check-ups, you should not have to guess at 11 PM. Registered by your hospital,
              Sakhi listens in her own language. It logs everyday symptoms and alerts her partner and
              care team within minutes when a warning sign appears.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#hear-sakhi"
                className="inline-flex min-h-[44px] items-center gap-2.5 rounded-full border border-white/40 bg-white/18 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/28"
              >
                <Play aria-hidden="true" className="h-4 w-4 fill-current text-[#F6C478]" />
                Listen to a Sample Call
              </a>
              <a
                href="#join"
                className="inline-flex min-h-[44px] items-center gap-1.5 px-2 py-2 text-xs font-semibold tracking-wider text-white/85 uppercase transition-colors hover:text-[#F6C478]"
              >
                How to Set It Up
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Subtle Couple Reassurance Row */}
            <div className="mt-8 flex flex-col gap-1.5 border-t border-white/15 pt-5 text-xs text-white/75 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
              <span>Registered by your hospital</span>
              <span aria-hidden="true" className="hidden text-white/35 sm:inline">
                ·
              </span>
              <span>No English or typing needed</span>
              <span aria-hidden="true" className="hidden text-white/35 sm:inline">
                ·
              </span>
              <span>Partner &amp; family stay informed</span>
            </div>
          </div>

          {/* Right Column: Subtle Pan-India Language Whispers + Sage Trust Card */}
          <div className="flex w-full flex-col items-start gap-4 lg:w-auto lg:items-end lg:pb-2">
            <div
              aria-hidden="true"
              className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs font-medium tracking-wide text-white/55 lg:justify-end"
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
            </div>

            {/* Floating Soft Sage-Mint Clinical Trust Card */}
            <div className="w-full max-w-[320px] shrink-0 rounded-2xl border border-[#102B22]/10 bg-[#98CFB4] p-5 text-[#102B22] shadow-[0_20px_50px_-15px_rgba(15,24,26,0.45)]">
              <p className="text-[13px] leading-snug font-medium">
                Guided strictly by her pregnancy week, her hospital’s visit schedule, and{" "}
                <strong className="font-semibold">
                  Ministry of Health danger-sign guidelines.
                </strong>
              </p>
              <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-[#102B22]/15 pt-3 text-[11px] font-semibold whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  Reviewed by Doctors
                </span>
                <span className="opacity-75">Never Diagnoses</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main id="main-content">
        {/* Section 2: Relatable Couple Moments + NFHS-6 Scale Strip */}
        <section id="the-gap" className="border-b border-[#0F181A]/10 bg-[#F7F4ED] py-18 sm:py-22">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-14">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#D97745] uppercase">
                Between Visits
              </p>
              <h2 className="mt-2.5 font-serif text-3xl font-semibold tracking-tight text-[#0F181A] sm:text-4xl">
                Every pregnancy has quiet questions.
              </h2>

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {COUPLE_MOMENTS.map((item) => (
                  <div
                    key={item.moment}
                    className="rounded-2xl border border-[#0F181A]/10 bg-[#FCFBF7] p-6"
                  >
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
                ))}
              </div>
            </div>

            <div className="border-t border-[#0F181A]/10 pt-12">
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
            </div>

            <div className="mx-auto mt-12 max-w-3xl border-t border-[#0F181A]/10 pt-10 text-center">
              <p className="font-serif text-xl leading-relaxed text-[#0F181A] sm:text-2xl">
                India still loses about 22,500 women a year in pregnancy and childbirth (88 per
                100,000 live births). Sakhi cannot stop all of these deaths. It aims at one thing:{" "}
                <span className="text-[#D97745] underline decoration-[#D97745]/35 underline-offset-4">
                  the delay between a warning sign and care.
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Interactive Split Stage */}
        <section id="hear-sakhi" className="bg-[#F7F4ED] py-18 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold tracking-[0.18em] text-[#D97745] uppercase">
                Hear Sakhi Work
              </p>
              <h2 className="mt-2.5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                One calm orb. From spoken worry to safe action in minutes.
              </h2>
            </div>

            <OrbShowcase />
          </div>
        </section>

        {/* Section 4: Asymmetric Hairline Editorial */}
        <section
          id="four-actions"
          className="border-t border-[#0F181A]/10 bg-[#F7F4ED] py-20 sm:py-26"
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-0">
              <div className="lg:col-span-5 lg:border-r lg:border-[#0F181A]/15 lg:pr-12">
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
                {FOUR_ACTIONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name} className="flex items-start gap-5">
                      <div
                        aria-hidden="true"
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0F181A] text-[#F7F4ED] shadow-sm"
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
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Safety Guardrails & Doctor's One-Page Timeline */}
        <section className="border-t border-[#0F181A]/10 bg-[#EFE8DA]/65 py-20 sm:py-26">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="text-xs font-semibold tracking-[0.18em] text-[#D97745] uppercase">
                  For Both Families &amp; Clinicians
                </p>
                <h2 className="mt-3 font-serif text-3xl leading-[1.12] font-semibold tracking-tight sm:text-4xl">
                  Walk into your check-up heard, not rushed.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#536360] sm:text-base">
                  Before every check-up, Sakhi reads her a short recap in her language. Her doctor
                  gets a dated one-page history in her exact words so nothing is missed.
                </p>

                <div className="mt-7 space-y-5">
                  {GUARDRAILS.map((rule) => (
                    <div key={rule.title} className="flex items-start gap-3.5">
                      <span
                        aria-hidden="true"
                        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2B7A5B]/15 text-[#2B7A5B]"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-[#0F181A]">{rule.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-[#536360] sm:text-sm">
                          {rule.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-[24px] border border-[#0F181A]/12 border-t-4 border-t-[#162B44] bg-[#FCFBF7] p-6 shadow-[0_24px_60px_-24px_rgba(15,24,26,0.2)] sm:p-9">
                  <div className="flex items-start justify-between gap-4 border-b border-[#0F181A]/12 pb-5">
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.16em] text-[#D97745] uppercase">
                        Pre-Visit Doctor Summary · Hospital Record
                      </p>
                      <h3 className="mt-1.5 font-serif text-xl font-semibold text-[#0F181A] sm:text-[1.45rem]">
                        One-Page Timeline in Her Words
                      </h3>
                    </div>
                    <span className="shrink-0 rounded-full border border-[#0F181A]/15 bg-[#F7F4ED] px-3 py-1 text-xs font-semibold text-[#0F181A] tabular-nums">
                      ANC Visit #3
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl bg-[#F7F4ED] p-3.5 text-xs">
                    <div>
                      <p className="text-[#536360]">Gestation</p>
                      <p className="mt-0.5 font-semibold text-[#0F181A] tabular-nums">
                        Week 32 · Day 2
                      </p>
                    </div>
                    <div>
                      <p className="text-[#536360]">Iron Tablets</p>
                      <p className="mt-0.5 font-semibold text-[#0F181A] tabular-nums">
                        24 / 28 days
                      </p>
                    </div>
                    <div>
                      <p className="text-[#536360]">Language</p>
                      <p className="mt-0.5 font-semibold text-[#0F181A]">Hindi (Confirmed)</p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-5 border-l-2 border-[#0F181A]/15 pl-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#C23B2B] uppercase">
                          19 Nov · Danger Alert Sent
                        </span>
                        <span className="rounded-full bg-[#98CFB4]/35 px-2.5 py-0.5 text-[11px] font-semibold text-[#102B22]">
                          Care team responded in 38m · Reached hospital
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-[#0F181A]">
                        “Do din se sar dard hai aur pair sujhe hue hain. Subah se thoda dhundhla
                        lag raha hai.”
                      </p>
                      <p className="mt-0.5 text-xs text-[#536360]">
                        MoH Rule: Pre-eclampsia danger triad · Patient confirmed repeat-back
                      </p>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-[#536360] uppercase">
                        14 Nov · Mild Symptom &amp; Habit Saved
                      </span>
                      <p className="mt-1 text-sm font-medium text-[#0F181A]">
                        “Kal raat iron ki goli lena bhool gayi, aur thakan lag rahi hai.”
                      </p>
                      <p className="mt-0.5 text-xs text-[#536360]">
                        Ruled out dizziness/breathlessness · Evening voice reminder scheduled
                      </p>
                    </div>
                  </div>

                  <p className="mt-6 border-t border-[#0F181A]/10 pt-4 text-[11px] text-[#536360]">
                    Note: Sakhi does not diagnose or advise on medicine. She receives a short spoken
                    recap before walking in, so the doctor no longer starts from nothing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Three Baseline-First Impact Signals */}
        <section id="impact" className="bg-[#F7F4ED] py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
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
              {IMPACT_SIGNALS.map((signal) => (
                <div key={signal.pillar}>
                  <p className="text-xs font-bold tracking-[0.16em] text-[#D97745] uppercase">
                    {signal.pillar}
                  </p>
                  <p className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#0F181A] tabular-nums sm:text-5xl">
                    {signal.metric}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[#536360]">{signal.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: Privacy Manifesto & Closing How-to-Join Vista */}
        <section id="privacy" className="px-4 pb-10 sm:px-8 sm:pb-14">
          <div
            id="join"
            className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-[#0F181A]/12 bg-[#F6D8B2] shadow-[0_30px_80px_-32px_rgba(15,24,26,0.22)]"
          >
            <Image
              src="/images/closing-dawn-water.jpg"
              alt="Warm morning apricot sky over distant sage-teal hills and a calm sunlit river"
              fill
              className="object-cover object-bottom"
              sizes="(max-width: 1200px) 100vw, 1152px"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#F6D8B2]/82 via-[#F6D8B2]/55 via-58% to-transparent" />

            <div className="relative z-10 flex flex-col items-center px-6 pt-14 pb-36 text-center sm:px-12 sm:pt-16 sm:pb-48">
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
                <span className="font-semibold">How your family starts:</span> Ask your hospital or
                OB-GYN to add you at your next visit. Setup takes 60 seconds on Android or iOS, with
                no passwords and no forms.
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-3.5">
                <a
                  href="mailto:pilot@sakhihealth.in?subject=Bring%20Sakhi%20to%20Our%20Hospital"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[#0F181A] px-7 py-3.5 text-xs font-semibold tracking-wider text-[#F7F4ED] uppercase shadow-sm transition-colors hover:bg-[#1E3A56]"
                >
                  Bring Sakhi to Your Hospital
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                </a>
                <a
                  href="#hear-sakhi"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[#0F181A]/35 bg-[#FAF6EE]/85 px-7 py-3.5 text-xs font-semibold tracking-wider text-[#0F181A] uppercase backdrop-blur-sm transition-colors hover:bg-white"
                >
                  Listen to a Sample Call
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 pb-10 text-xs text-[#536360] sm:flex-row sm:px-8">
        <p className="font-medium text-[#0F181A]">
          <span translate="no">Sakhi</span> · Voice-first maternal care companion for India
        </p>
        <p>Cities, towns &amp; villages · Android &amp; iOS · Hospital-owned records</p>
      </footer>
    </div>
  );
}
