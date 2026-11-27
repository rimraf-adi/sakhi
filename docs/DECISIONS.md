# Sakhi — Architecture & Sprint Decisions

## 1. Mobile App Delivery Strategy (3-Day Sprint)
- **Chosen Approach**: **Option 1 — Mobile-First PWA / Device-Framed Web App (`apps/app`)** inside the Turborepo alongside `apps/landing-page` (Landing Page).
- **Rationale**:
  - **Zero native build friction**: Pure Next.js/React in Turborepo, sharing workspace packages cleanly without Gradle/Metro/Xcode bottlenecks.
  - **Automated media capture**: Pixel-perfect `390×844` mobile screenshots and 4K/60fps demo videos **with crisp internal Hindi/Marathi voice audio** via Playwright + `ffmpeg` (or Remotion).
  - **Live judge access**: 1-click live URL playable on any Android, iPhone, or desktop browser, plus full-screen "Add to Home Screen" PWA mode with real microphone + Groq Whisper STT + Ministry of Health danger-sign rules + voice TTS.
- **Status**: Planned — execute when instructed.

## 2. Standing Engineering & Visual Rules
- **Simple Commit Messages Always**: Keep all git commit messages short, plain, and straightforward (e.g., `init sakhi monorepo and landing page`).
- **No Complicated AI-Generated Images**: Avoid complex AI-generated raster artwork. Prefer clean, lightweight CSS gradients, subtle grain, and minimal layered vector SVG shapes.
- **GitHub Remote**: `https://github.com/rimraf-adi/sakhi.git`

