# Sakhi — Landing Page UX Reference (`ux-lp.md`)

Grounded strictly in [R1.md](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/R1.md) and the six landing-page visual references in `docs/lp-ref/`:
1. [calmy-night-doorway-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/calmy-night-doorway-ref.jpg)
2. [sukoya-split-silhouette-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/sukoya-split-silhouette-ref.jpg)
3. [heritage-layered-vista-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/heritage-layered-vista-ref.jpg)
4. [duna-landscape-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/duna-landscape-ref.jpg)
5. [snapsound-editorial-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/snapsound-editorial-ref.jpg)
6. [sayings-hero-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/sayings-hero-ref.jpg)

---

## 1. Landing Page Purpose & Audience

Per [R1.md](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/R1.md), pregnant women do **not** sign up on a marketing website—**her hospital registers her** in the Sakhi app for Android or iOS.

Therefore, the landing page is built for **evaluators, hospital leaders, antenatal doctors, and public-health / ASHA program directors**. In one unhurried scroll, the page must accomplish two things:
1. **Emotional & Sensory Proof (First 10 Seconds)**: Let visitors immediately *see and hear* how a woman who never types and never uses menus speaks to a calm, glowing orb in her own language—and how the agent acts within minutes.
2. **Clinical & Operational Trust (Rest of Page)**: Prove why Sakhi is safe—strictly bounded to 4 actions (`Alert`, `Save`, `Remind`, `Summarize`), governed by Ministry of Health danger-sign rules, confirmed via repeat-back, audited monthly by doctors, and owned privately by her hospital.

---

## 2. How the 6 Visual References Map to the Landing Page

Across all six references, one shared aesthetic emerges: **scenic storybook/editorial illustration, warm light against deep twilight/slate silhouettes, classic high-contrast serif display type, tactile paper whitespace, and pill CTAs—with zero generic SaaS bento boxes.**

| Reference File | What We Borrow | Where It Lives on Sakhi LP |
| :--- | :--- | :--- |
| [calmy-night-doorway-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/calmy-night-doorway-ref.jpg) | • **3 floating white pill islands** for top nav<br>• Left-aligned white serif hero headline + **frosted-glass pill CTA**<br>• Painterly night hillside with **warm golden light spilling from an open doorway** beside a seated woman<br>• Floating **soft sage-mint clinical trust card** in bottom-right | **Section 0 (Nav) & Section 1 (Hero)**: Captures a warning sign starting at home after clinic hours, illuminated by Sakhi’s warm golden glow. |
| [duna-landscape-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/duna-landscape-ref.jpg) | • Seamless transition from scenic hero into clean light editorial space<br>• **Borderless horizontal stat strip** divided only by thin vertical hairlines<br>• Clean 3-column icon + short prose grid | **Section 2 (NFHS-6 Scale Strip)** & **Section 6 (3 Impact Signals: Speed, Habits, Safety)**. |
| [sukoya-split-silhouette-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/sukoya-split-silhouette-ref.jpg) + [sayings-hero-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/sayings-hero-ref.jpg) | • **50/50 split stage** with tactile grain texture<br>• Warm human/scenic context on one half merging into a **deep obsidian-ink (`#0E1517`) panel** on the other<br>• Fine hairline-bordered pill buttons | **Section 3 (Interactive Voice Orb Stage)**: Left shows the woman’s real-life spoken prompt in Hindi/Marathi; right houses the glowing Orb & live 4-step rule trace. |
| [snapsound-editorial-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/snapsound-editorial-ref.jpg) | • Warm tactile paper canvas (`#F7F4ED`) with generous vertical rhythm<br>• **Asymmetric two-column layout** divided by a crisp vertical hairline rule: bold serif thesis on left, circular dark-icon feature rows on right<br>• Organic stippled/paper-cut decorative accents | **Section 4 ("Four Actions. Zero Guesswork.")** & **Section 5 (Guardrails + Doctor’s One-Page Timeline)**. |
| [heritage-layered-vista-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/heritage-layered-vista-ref.jpg) | • Warm **apricot-sandstone sky (`#F5D6AE`)** over layered deep slate-teal silhouettes (`#182C2E`) and sunlit golden-ochre highlights (`#E69F45`)<br>• Centered classic serif + italic epigraph + delicate outlined pill CTA | **Section 7 (Privacy & Hospital Pilot Closing Vista)**: Illustrated Indian village-to-hospital horizon closing the page with warmth and dignity. |

### Anti-Patterns (Strictly Avoided on This LP)
* No chat-bubble or text-input mockups (contradicts *"A form, a menu, or a chat window excludes them"*).
* No SaaS pricing tables, dashboard charts, or multi-tab settings screenshots.
* No stock photos of stethoscopes or generic AI robot icons.

---

## 3. Visual Tokens & Typography Specification

### Color Palette
| Token | Hex | Usage on Landing Page |
| :--- | :--- | :--- |
| `Twilight Indigo` | `#162B44` → `#1E3A56` | Hero night sky gradient (`calmy` reference) |
| `Doorway / Orb Gold` | `#F6C478` → `#D97745` | Warm light spilling from hero doorway & core of the Sakhi Orb |
| `Sage Trust Mint` | `#98CFB4` (ink `#102B22`) | Floating clinical trust badge in hero & positive habit tags (`calmy` reference) |
| `Paper Ivory` | `#F7F4ED` | Primary editorial page background below hero (`snapsound` reference) |
| `Obsidian Ink` | `#0F181A` | Primary serif ink, dark split-stage card (`sukoya` / `sayings`), circular icons |
| `Muted Slate` | `#536360` | Body paragraphs, captions, stat subtitles |
| `Apricot Sandstone` | `#F5D6AE` | Closing vista sky & warm callout highlight (`heritage` reference) |
| `Clinical Vermilion` | `#C23B2B` | Used exclusively to highlight MoH **Danger-Sign `Alert`** states |

### Typography & Button Styles
* **Display Serif (`Fraunces` / `Newsreader`)**: High-contrast, warm editorial serif with soft terminals.
  * Hero `H1`: `56px–68px`, line-height `1.06`, tracking `-0.02em`.
  * Section `H2`: `38px–46px`, line-height `1.12`.
* **UI & Body Sans (`Plus Jakarta Sans` / `DM Sans` + `Noto Sans Devanagari`)**:
  * Body copy: `16px–18px`, line-height `1.65`, max measure `58ch`.
  * Hindi/Marathi spoken quotes: Rendered in clean romanized script alongside Devanagari/English translation so every visitor can read the rhythm accurately.
* **Three Signature Pill Treatments**:
  1. **Floating White Nav Islands (`calmy`)**: Solid `#FFFFFF`, `rounded-full`, soft shadow, dark `#0F181A` text.
  2. **Frosted Glass Hero CTA (`calmy`)**: `bg-white/18 backdrop-blur-md border border-white/40 text-white rounded-full px-7 py-3.5`.
  3. **Hairline Editorial Pill (`sukoya` / `heritage`)**: `border border-current/30 rounded-full px-6 py-2.5 text-xs tracking-wider uppercase`.

---

## 4. Section-by-Section UX Blueprint

### Section 0 — Three-Island Floating Navbar (`calmy` pattern)
Floats directly over the top of the scenic hero canvas (`max-w-6xl`, `pt-6`):
* **Left Pill**: Glowing amber dot + `Sakhi` (serif wordmark)
* **Center Pill**: `The Gap` · `Hear Sakhi` · `4 Actions` · `Impact` · `Privacy`
* **Right Pill**: `Hospital Pilot` (links smoothly to `#pilot`)

---

### Section 1 — Scenic Hero: *"The woman talks. The agent does the work."* (`calmy` + `heritage` pattern)

```text
+-----------------------------------------------------------------------------+
|  ( (o) Sakhi )       ( The Gap · Hear Sakhi · 4 Actions · Impact )  (Pilot) |
|                                                                             |
|  The woman talks.                                       /|                  |
|  The agent does the work.                              / |  [Warm Golden    |
|                                                       |  |   Light Spilling |
|  A voice-first agent for pregnant women in India.     |  |   From Home      |
|  Registered by her hospital, Sakhi listens in her     |  |   Doorway Around |
|  own language and acts on warning signs in minutes.   | /    Seated Mother] |
|                                                      /|/                    |
|  (  (>) Hear a 20-Second Call  )                .. .''                      |
|                                            +-----------------------------+  |
|                                            | [Sage Mint Clinical Card]   |  |
|                                            | Built on Ministry of Health |  |
|                                            | danger-sign rules.          |  |
|                                            | (w) Doctor-Tested & Logged  |  |
|                                            +-----------------------------+  |
+-----------------------------------------------------------------------------+
```

* **UX Intent**: Visitors immediately grasp the human situation without reading dense medical jargon: a pregnant woman at home between check-ups, bathed in warm, reassuring golden light rather than isolated in the dark.
* **Primary Action**: Clicking `(>) Hear a 20-Second Call` scrolls smoothly into (or plays inline audio from) the Interactive Voice Orb Stage right below.

---

### Section 2 — Borderless NFHS-6 Scale & Care-Gap Strip (`duna` pattern)

Transitions cleanly onto `Paper Ivory` (`#F7F4ED`) with generous whitespace and four hairline-separated typographic columns:

| Metric | Primary Label | Grounded Context (`R1.md`) |
| :--- | :--- | :--- |
| **`25M`** | Births in India every year | Across every state and language, in villages and cities |
| **`~9M`** | Miss 4 antenatal check-ups | Roughly 1 in 3 women (NFHS-6) face long silent gaps in care |
| **`55%`** | Take iron tablets for 100 days | Nearly half miss critical daily supplementation between visits |
| **`10.6%`** | Speak English in India | Forms, menus, and text chats exclude most women—voice is essential |

Below the strip sits a single centered editorial statement:
> *"India still loses about 22,500 women a year in pregnancy and childbirth (88 per 100,000 live births). Sakhi cannot stop all of these deaths. It aims at one thing: **the delay between a warning sign and care.***"

---

### Section 3 — Interactive Split Stage: Hear Sakhi Work (`sukoya` + `sayings` pattern)

A rounded `32px` split-panel showcase with subtle film grain (`sayings`), framed half in warm sandstone/paper illustration and half in deep `Obsidian Ink` (`#0F181A`):

```text
+--------------------------------------+--------------------------------------+
| [LEFT: WARM ILLUSTRATED CONTEXT]     | [RIGHT: OBSIDIAN INK ORB STAGE]      |
|                                      |                                      |
| "She never types.                    |    Registered · Week 32 · Hindi      |
|  She never uses menus."              |                                      |
|                                      |              ( ( ORB ) )             |
| Choose a real voice moment:          |          [Play Warm Voice Audio]     |
|                                      |                                      |
| (*) Headache & Swollen Feet (Hindi)  | 1. SHE SPEAKS                        |
| ( ) Less Baby Movement (Marathi)     |    "Do din se sar dard hai aur       |
| ( ) Missed Iron Tablet (Hindi)       |     pair sujhe hue hain."            |
|                                      | 2. ONE STAGE-FIT QUESTION            |
|                                      |    "Dhundhla dikh raha hai?" -> Haan |
| [Before vs. With Sakhi Micro-Note]   | 3. REPEAT-BACK & CONFIRM             |
| Wait drops from "until my next       |    Repeats in Hindi; she confirms.   |
| visit" to minutes.                   | 4. ACTION -> [ALERT: HOSPITAL NOW]   |
|                                      |    + Alerts ASHA Worker & Family     |
+--------------------------------------+--------------------------------------+
```

* **Interactive UX Behavior**:
  * **Zero Text Input**: Visitors cannot type into Sakhi—reinforcing the core product constraint. Instead, they click one of three realistic spoken scenarios from `R1.md`:
    1. **Clear Danger Sign (Hindi, Week 32)**: Headache + swollen feet → asks `"Dhundhla dikh raha hai?"` → repeats back → **`Alert`** (Go to hospital now + notifies ASHA & family).
    2. **Unclear / Doubtful Symptom (Marathi, Week 35)**: Less baby movement with uncertain timing → asks 1 follow-up → still unsure → **treats doubt as serious (`Alert`)**.
    3. **Mild Symptom & Habit (Hindi, Week 22)**: Missed iron tablet + mild fatigue → rules out danger sign → **`Save` & `Remind`**.
  * **Audio Playback**: Optional Web Speech / pre-generated warm female voice playback lets visitors *hear* the Hindi/Marathi interaction while watching the Orb’s aura shift from calm amber (listening/repeating) to urgent vermilion (`Alert`) or calm sage (`Save`).

---

### Section 4 — Asymmetric Hairline Editorial: *"Four actions. Zero guesswork."* (`snapsound` pattern)

Directly adopts the two-column hairline-rule composition from [snapsound-editorial-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/snapsound-editorial-ref.jpg) on warm `Paper Ivory`:

```text
+-----------------------------------+-----------------------------------------+
|                                   |  ( ! )  Alert                           |
|       Four actions.               |         Tells her to go to the hospital |
|      Zero guesswork.              |         now and alerts her ASHA worker  |
|             ___                   |         and chosen family member.       |
|                                   |                                         |
|    Sakhi never diagnoses,         |  ( + )  Save                            |
|   never advises on medicine,      |         Logs mild symptoms and missed   |
|    and never answers from         |         iron tablets with dates so      |
|      general knowledge.           |         nothing is forgotten.           |
|                                   |                                         |
|   Every reply comes strictly      |  ( ~ )  Remind                          |
|   from her pregnancy week,        |         Spoken reminders in her own     |
|   earlier symptoms, hospital      |         language for check-up dates     |
|   visit dates, and Ministry       |         and daily iron tablets.         |
|   of Health danger-sign rules.    |                                         |
|                                   |  ( = )  Summarize                       |
|                                   |         Reads her a short pre-visit     |
|                                   |         recap and gives her doctor a    |
|                                   |         1-page timeline in her words.   |
+-----------------------------------+-----------------------------------------+
```

---

### Section 5 — From Forgotten Worry to a One-Page Doctor Timeline

Shows the tangible clinical handoff that changes prenatal visits for both the mother and her busy OPD doctor:
* **Left Column — How Safety Guardrails Work Together**:
  * **Repeat-Back Confirmation**: Repeats what it heard in her language and waits for her confirmation before deciding.
  * **Escalate on Doubt**: If a symptom remains unclear after one short question, Sakhi treats the case as *more serious, not less*, and sends her to her ASHA worker or hospital.
  * **Honest About Real-World Voice Risk**: Explicitly addresses regional Hindi, Marathi, and mixed-speech ASR risk from `R1.md`—showing why doctors test realistic cases pre-launch and every answer is logged for hospital inspection.
* **Right Column — Tactile Paper Artifact: The Doctor’s One-Page Summary**:
  * Styled like a crisp physical clinic sheet pinned over warm sand (`#EFE8DA`), showing:
    * Patient gestational week (`Week 32`), preferred language (`Hindi`), iron tablet adherence (`24 / 28 days`), and next hospital visit date.
    * Dated chronological entries **in her own words** (both mild saved entries and any escalated danger alerts with ASHA response timestamps)—proving the doctor *"no longer starts from nothing."*

---

### Section 6 — Three Signals Tracked Against Baseline (`duna` 3-column pattern)

Clean, uncrowded three-column typographic layout emphasizing `R1.md`’s commitment to measuring each hospital’s baseline first:

1. **Speed**
   * **`9 in 10`** danger alerts get a human response within **2 hours**, and **`8 in 10`** of those women reach a facility the **same day**.
2. **Habits**
   * **`+10 percentage points`** higher iron tablet adherence and check-up attendance among women using Sakhi vs. similar women without it.
3. **Safety**
   * **`0 missed danger signs`** and **`< 1 false alarm in 5`** in monthly doctor reviews of sampled conversations.

---

### Section 7 — Privacy Manifesto & Closing Hospital Pilot Vista (`heritage` pattern)

Closes with a warm apricot-sandstone (`#F5D6AE`) to layered slate-teal (`#182C2E`) illustrated Indian horizon inspired by [heritage-layered-vista-ref.jpg](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/lp-ref/heritage-layered-vista-ref.jpg):

* **Privacy Pledge (Verbatim to `R1.md` Principles)**:
  * *"Privacy comes first. Her record stays with her hospital."*
  * *"We do not sell data or share it with private companies."*
  * *"Only government health professionals and public-health researchers see grouped data with no names, and only with her consent."*
* **Centered Closing Serif Callout & Hairline Pill CTA**:
  * Headline: *"Bring Sakhi to your antenatal clinic."*
  * Subtitle: *"For government & partner hospitals, OB-GYN departments, and ASHA maternal health programs on Android and iOS."*
  * CTA Pills: `[ Request a Hospital Pilot ]` · `[ Review Clinical Safety Cases ]`

---

## 5. Responsive Mobile Adaptation Rules

 evaluators and doctors often open links on mobile phones:
1. **Navbar**: Collapses from 3 pills into 2 compact floating pills (`(o) Sakhi` on left, `Hospital Pilot` on right—no complex mobile drawer needed).
2. **Hero**: Headline stacks cleanly at top over twilight sky; doorway illustration + sage clinical trust card sit directly beneath in the first viewport fold.
3. **Split Orb Stage**: Stacks Orb + scenario pills above the 4-step live trace so tapping a scenario immediately updates the visible Orb without scrolling away.
4. **Hairline Asymmetric Section**: Vertical hairline converts into horizontal editorial dividers between the 4 actions while preserving generous padding.
