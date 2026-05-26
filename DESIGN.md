---
name: cupel
description: Burn off the dross; keep the gold. The docs design system, set as a fire-assay report.
colors:
  ink: "oklch(0.245 0.018 50)"
  ink-2: "oklch(0.380 0.020 50)"
  ink-3: "oklch(0.500 0.020 52)"
  ink-4: "oklch(0.610 0.016 55)"
  bone-ash-bg: "oklch(0.955 0.010 72)"
  bone-ash-alt: "oklch(0.925 0.014 72)"
  surface: "oklch(0.985 0.006 72)"
  gold: "oklch(0.660 0.080 84)"
  gold-deep: "oklch(0.535 0.072 80)"
  gold-soft: "oklch(0.760 0.045 86)"
  rule: "oklch(0.890 0.008 80)"
  border: "oklch(0.910 0.007 80)"
typography:
  display:
    fontFamily: "Hedvig Letters Serif, Spectral, Georgia, serif"
    fontSize: "clamp(2.5rem, 5vw, 4.25rem)"
    fontWeight: 400
    lineHeight: 1.0
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Hedvig Letters Serif, Spectral, Georgia, serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Spectral, Iowan Old Style, Palatino, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.68
    fontFeature: "'onum' 1, 'kern' 1, 'liga' 1"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.13em"
rounded:
  sm: "2px"
  md: "4px"
  lg: "5px"
spacing:
  step: "0.4375rem"
  inset: "1.125rem"
  flow: "clamp(2.375rem, 5vw, 4rem)"
components:
  nav-link:
    textColor: "{colors.ink-3}"
    typography: "{typography.label}"
  button-ghost:
    textColor: "{colors.ink-3}"
    rounded: "{rounded.sm}"
    padding: "3px 10px"
  callout-note:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "18px 20px"
---

# Design System: cupel

## 1. Overview

**Creative North Star: "The Assay Report"**

cupel's docs are set like a fire-assay report. A cupel is the bone-ash vessel where a sample is melted until the base metal burns away and only the pure bead of gold or silver remains. The whole surface enacts that idea: warm chalky bone-ash paper, ink the color of struck type, and a single refined gold accent used as a hint rather than a flood. The page is structured as numbered assay steps, each opened by a "fineness rule" (a struck number, a mono kicker, and a dotted leader) so reading the docs feels like reading a careful report, not browsing a SaaS site.

Typographically the system is a three-voice pairing with genuine contrast: an inscriptional serif for display, a warm reading serif for body, and a monospace reserved for data, code, and labels. Hierarchy is built from scale plus weight plus the shift between voices, never from decoration. The register is **product**: type sizes below the display headings live on a fixed `rem` scale so the reading column stays predictable, and only the page masthead and section titles keep a gentle fluid range.

This system explicitly rejects over-decoration: no extra weights or fonts beyond the three voices, no decorative display type pressed into body copy, no ornamental noise. It rejects generic SaaS defaults (system fonts, cream gradients, hero-metric blocks) and fintech / trading clichés (navy-and-gold, ticker density). cupel never trades, and the design must never suggest otherwise.

**Key Characteristics:**
- Bone-ash paper, struck ink, one restrained gold accent.
- Three type voices: inscriptional display, reading serif, mono data.
- Old-style numerals in prose; lining numerals in code and tables.
- Assay-step structure with fineness-rule dividers and an occasional drop cap.
- Calm, exact, literate. Restraint reads as confidence.

## 2. Colors

A warm, paper-and-ink palette: every neutral is tinted toward a warm red-orange hue (never navy), with one muted gold as the only chromatic voice.

### Primary
- **Refined Gold** (`oklch(0.660 0.080 84)`): the bead left in the cupel. A muted, low-chroma warm gold used only as a hint, underlines, list markers, the drop cap, fineness numbers, the assay-note dot.
- **Struck Gold** (`oklch(0.535 0.072 80)`): the darker, text-safe gold for kickers, eyebrows, command names, current-page nav, and links-on-hover where contrast must hold.
- **Faint Gold** (`oklch(0.760 0.045 86)`): hairline underlines and the faintest fills.

### Neutral
- **Struck Ink** (`oklch(0.245 0.018 50)`): primary body and heading text.
- **Ink 2 / 3 / 4** (`0.380 / 0.500 / 0.610` L): a four-step ink ramp for secondary prose, mono labels, captions, and the quietest metadata.
- **Bone-Ash Paper** (`oklch(0.955 0.010 72)`): the page ground; a warm chalky off-white.
- **Bone-Ash Alt** (`oklch(0.925 0.014 72)`): code blocks, the vault tree, inline-code fills.
- **Surface** (`oklch(0.985 0.006 72)`): the assay-note callout ground.
- **Rule / Border** (`oklch(0.890 / 0.910` L): hairline dividers and box strokes.

Both themes ship via `light-dark()`; the dark theme is an ember-tinted charcoal (hue ~45), not a cool gray. Frontmatter records the light values as canonical.

### Named Rules
**The Hint-of-Gold Rule.** Gold is a bead, not a coat. It appears on a small fraction of any screen, as accent and signal only. If gold starts to feel like a theme color, it is overused; pull it back to ink.

## 3. Typography

**Display Font:** Hedvig Letters Serif (with Spectral, Georgia, serif)
**Body Font:** Spectral (with Iowan Old Style, Palatino, Georgia, serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, SF Mono, Menlo)

**Character:** Inscriptional and quarried for display; warm, literary, and readable for body; precise and technical for data. The contrast between the three voices does the hierarchy work, so weights stay minimal (400 for serif text, 500/600 for mono labels).

### Hierarchy
- **Masthead** (display, `clamp(1.75rem→4.25rem)` via `--text-mast`, lh 1.0): the page title, once per page.
- **Title** (display, `clamp(1.75rem→2.5rem)` via `--text-title`, lh 1.08): the title of each assay step.
- **Name** (display, `clamp(1.4375rem→1.875rem)` via `--text-name`): canon thinker names.
- **Body** (Spectral, `1.1875rem` / 19px via `--text-body`, lh 1.68, old-style nums): the reading column, capped at ~60-65ch.
- **Secondary** (`1.0625rem` / 17px via `--text-md`): command jobs, cited works.
- **UI** (`0.9375rem` / 15px via `--text-ui`): nav links, command names, footer links.
- **Mono** (`0.8125rem` / 13px via `--text-mono`): sidebar links, step numbers, code, the vault tree.
- **Micro label** (mono, `0.6875rem` / 11px via `--text-micro`, uppercase, 0.13em tracking): eyebrows, kickers, tags, table heads.

### Named Rules
**The rem-Scale Rule.** Type is always sized in `rem` (or `em`), never `px`, and the root stays at `100%`, so the reader's browser font-size setting is always honored. Sizes come from the `--text-*` tokens, never literals.
**The Two-Step Label Rule.** The small mono labels collapse to exactly two steps (11px micro, 13px mono). New near-neighbors (11.5, 12.5, 13.5) are forbidden; they reintroduce the muddy scale.
**The Three-Voice Rule.** Exactly three families: inscriptional display, reading serif, mono. Adding a fourth, or a new weight, is over-decoration.

## 4. Elevation

Flat by default. The system conveys depth through hairline rules, tonal layering (paper / alt / surface), and dotted leaders, not shadows. The only blur is a light backdrop on the sticky nav. There is no shadow vocabulary; introducing drop shadows would read as the SaaS aesthetic this design rejects.

### Named Rules
**The Hairline Rule.** Structure is drawn with 1px rules and full borders, never with shadows or colored side-stripes.

## 5. Components

### Buttons
- **Shape:** minimal, near-square (`2px` radius).
- **Theme toggle (ghost):** the only button. Ink-3 text and a mono glyph; on hover, struck-gold text on a faint bone-ash-alt fill. No fill at rest.
- **Hover / Focus:** color transitions only (150ms). Focus shows a 2px struck-gold outline, offset 2px.

### Cards / Containers
- **Assay note (callout):** the single callout style. Surface ground, 1px border, `4px` radius, 18-20px inset. A mono uppercase struck-gold label preceded by a 6px gold dot. No nested cards; no colored side-stripe.
- **Code / vault:** bone-ash-alt ground, 1px border, mono at 13px, lining numerals, horizontal scroll when needed.

### Navigation
- **Top nav:** sticky, hairline-bottomed, light backdrop blur. Display wordmark left; mono-feel UI links right at 15px. Links are ink-3, ink on hover, struck-gold for the current page.
- **Sidebar:** persistent left rail of numbered mono links with scroll-spy; current section goes ink + 600 weight with a struck-gold number. Folds to a wrapped top list below 860px.

### Signature: the fineness rule
Each assay step opens with one line: a struck mono step number (struck-gold, 0.12em tracking), a mono uppercase kicker (ink-4), and a dashed leader that fills the remaining width. This is the system's most distinctive pattern and should open every step.

## 6. Do's and Don'ts

### Do:
- **Do** size every piece of text with a `--text-*` token in `rem`; keep `html { font-size: 100% }`.
- **Do** keep the mono labels to the two steps (`--text-micro` 11px, `--text-mono` 13px).
- **Do** use old-style numerals in prose and lining numerals in code and tables.
- **Do** hold to three type voices and minimal weights (400 serif, 500/600 mono).
- **Do** open each step with the fineness rule (number, kicker, dotted leader).
- **Do** keep gold to a hint: markers, underlines, the drop cap, fineness numbers.

### Don't:
- **Don't** use `px` for any font size, and don't pin the root font-size in `px` (it breaks user zoom and font-size preferences).
- **Don't** reintroduce muddy near-neighbor sizes (11.5 / 12.5 / 13.5px) or pick sizes off the scale.
- **Don't** over-decorate: no fourth font, no extra weights, no decorative display type in body copy, no ornamental flourishes.
- **Don't** drift toward generic SaaS (system fonts, cream gradients, hero-metric blocks) or fintech / trading clichés (navy-and-gold, ticker density). cupel never trades.
- **Don't** add drop shadows, glassmorphism, gradient text, or colored `border-left` side-stripes.
- **Don't** let gold become a theme color; if it reads as a coat rather than a bead, pull it back.
