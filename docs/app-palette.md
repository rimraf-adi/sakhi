# Sakhi App Color Palette

Grounded in [R1.md](file:///Users/adityakinjawadekar/Documents/100xcode/sakhi/docs/R1.md).

## Why Color Matters More Here Than in Most Apps
In Sakhi, **the woman never types and never uses menus.** Only 10.6% of Indians speak English, and many pregnant women cannot read or type easily in any language. That means **Orb color, surface warmth, and motion ARE the interface**:

1. **Zero-literacy clarity**: She must tell at a glance whether Sakhi is listening calmly, waiting for her confirmation, saving a mild note, or urgently telling her to go to the hospital now.
2. **Real-world Indian Android LCD legibility**: High-contrast, sunlit-friendly daylight tokens and low-glare night tokens so the Orb stays unmistakable in a bright courtyard or a dark bedroom at 2 AM.
3. **Warm sister (*Sakhi*), never sterile clinic**: Avoids cold hospital blues or harsh neon alerts during routine check-ins so women speak honestly every day.
4. **Strict reservation of red**: Danger-sign vermilion appears *only* when Ministry of Health rules trigger `Alert` (or escalate on doubt)—never as decoration.

---

## 1. Canvas & Ink Surfaces (Day + Night)

| Token | Name | Hex | Role in App |
| :--- | :--- | :--- | :--- |
| `--bg-day` | **Khadi Ivory** | `#FAF6EE` | Primary daytime background; warm, low-glare paper tone |
| `--surface-day` | **Warm Sandstone** | `#EFE6D5` | Subtle bottom sheet / offline emergency contact strip |
| `--ink-day` | **Charcoal Banyan** | `#132623` | High-contrast icons, hospital emblem, and optional helper text |
| `--bg-night` | **Deep Neem Night** | `#102320` | Calm night-time mode for bedroom check-ins without harsh glare |
| `--ink-night` | **Warm Paper** | `#F7F4ED` | Legible contrast ink on night canvas |

---

## 2. Orb State & Action Palette

| State / Action (`R1.md`) | Palette Name | Core / Gradient Hex | Supporting Surface / Ring | Meaning to the Mother |
| :--- | :--- | :--- | :--- | :--- |
| **Idle & Speaking** | **Diya Gold → Terracotta** | `#FFF0D4` → `#F4B860` → `#D97745` | Soft ambient warmth (`#D97745` @ 20%) | *"I am here. Tap anywhere and speak to me."* |
| **Listening** | **Soft Lotus Amber** | `#FFF4DC` → `#F6C97E` → `#E28A52` | Concentric voice-synced ripples (`#D97745` @ 35%) | *"I am listening—take your time."* |
| **Repeat-Back Confirmation** | **Haldi Ring + Tulsi Check** | `#E09132` steady double-ring | Confirm button: **Tulsi Green** (`#247A57`)<br>Redo button: **Warm Ochre** (`#E8B87D`) | *"Did I hear you right? Say Haan or tap green."* |
| **`Alert` (Danger / Doubt)** | **Kumkum Vermilion** | `#FFD8C9` → `#DF5743` → `#C93B2B` | Alert wash: `#FFF1ED`<br>Giant Call CTA: `#1F8A5B` (ASHA / Hospital) | *"Go to the hospital now. ASHA & family alerted."* |
| **`Save`** | **Tulsi Leaf** | `#E7F8EF` → `#98CFB4` → `#247A57` | Soft sage confirmation bloom (`#247A57` @ 16%) | *"Saved safely in your hospital record."* |
| **`Remind`** | **Marigold Sun** | `#FFF4DC` → `#F4B860` → `#E09132` | Gentle banner wash: `#FDF3E3` | *"Time for your iron tablet / upcoming visit."* |
| **`Summarize`** | **Warm Sandstone + Slate** | `#EFE6D5` surface + `#1E3A56` accent | Pre-visit voice recap & doctor 1-page timeline | *"Here is what you shared before your visit."* |

---

## 3. Accessibility & Guardrail Rules
- **Contrast**: All primary buttons (`#1F8A5B` Call button, `#247A57` Confirm button, `#C93B2B` Alert badge) maintain `≥ 4.5:1` contrast with `#FFFFFF` or `#FAF6EE`.
- **Never color-only**: Every state pairs color with distinct **motion + audio + shape** (slow breath for Idle, expanding ripples for Listening, steady double-ring for Repeat-Back, urgent pulse + 3-person medallions + giant phone icon for `Alert`).
- **Offline Rural Fallback**: When network drops, the Orb dims gently to `#EFE6D5` while keeping the `#1F8A5B` direct-dial buttons for **ASHA Worker**, **Chosen Family Member**, and **Hospital** lit and ready offline.
