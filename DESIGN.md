---
name: Obsidian Emerald Utility
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#414944'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#717974'
  outline-variant: '#c0c9c2'
  surface-tint: '#396754'
  primary: '#013626'
  on-primary: '#ffffff'
  primary-container: '#1e4d3b'
  on-primary-container: '#8cbda6'
  inverse-primary: '#a0d1b9'
  secondary: '#885200'
  on-secondary: '#ffffff'
  secondary-container: '#fead4d'
  on-secondary-container: '#704200'
  tertiary: '#4c2120'
  on-tertiary: '#ffffff'
  tertiary-container: '#673735'
  on-tertiary-container: '#e3a29e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bbeed5'
  primary-fixed-dim: '#a0d1b9'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#204f3d'
  secondary-fixed: '#ffddbb'
  secondary-fixed-dim: '#ffb868'
  on-secondary-fixed: '#2b1700'
  on-secondary-fixed-variant: '#673d00'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#fab5b1'
  on-tertiary-fixed: '#350f0f'
  on-tertiary-fixed-variant: '#693937'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-display:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  code-snippet:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 16px
---

## Brand & Style
The design system is anchored in a high-contrast, professional aesthetic that balances deep, authoritative greens with high-energy accents. It is designed for a target audience of technical professionals, operators, and data-driven users who value functional elegance over decorative flourish. 

The style is a hybrid of **Modern Minimalism** and **Technical Utility**. It prioritizes data density and rapid information processing. By using a "Rich Black" foundation against crisp white surfaces and deep green primaries, the UI evokes a sense of stability, precision, and high-performance utility. The emotional response should be one of "controlled power"—a tool that feels robust, fast, and uncompromisingly clear.

## Colors
The color palette is designed for maximum legibility and functional signaling. 

- **Primary (#1E4D3B):** Used for primary actions, active navigation states, and branding elements. It represents the "grounded" nature of the tool.
- **Secondary (#E89B3C):** Reserved for highlights, notifications of moderate importance, or specific call-to-action modifiers that need to break the green/black dominance.
- **Neutral/Background (#1A1A1A):** Used for primary text and high-contrast dark-mode surfaces. In light mode, this serves as the "Ink" color for all primary typography to ensure WCAG AAA compliance.
- **Surface Strategy:** Use subtle grays (e.g., #F5F5F5) for background containers to allow the deep green and rich black elements to pop.
- **Semantic Colors:** These follow standard utility conventions but are calibrated for high saturation to remain visible against both light and dark backgrounds.

## Typography
The typography system uses a dual-font strategy to differentiate between narrative content and technical data.

- **Inter:** Chosen for its exceptional legibility and neutral tone. It handles all UI chrome, headings, and instructional body text. Bold weights (700) are used for hierarchy, while Regular weights (400) ensure breathability in dense layouts.
- **JetBrains Mono:** Utilized exclusively for data values, IDs, code snippets, and technical labels. The monospaced nature ensures that columns of numbers align perfectly, aiding in rapid data comparison.
- **Scale:** High-level headers use tight letter spacing to feel modern and "designed," while small labels use expanded tracking (0.05em) for clarity at small sizes.

## Layout & Spacing
The design system employs a **Fluid-Fixed Hybrid Grid**. The layout uses a 12-column grid system for desktop with a maximum container width of 1280px to prevent excessive line lengths in data tables.

- **Rhythm:** An 8px base grid drives all spatial decisions. Elements are spaced in increments of 4, 8, 16, 24, and 40 pixels.
- **Density:** For utility screens, use `spacing-sm` (8px) for internal component padding to maximize data visibility.
- **Mobile:** On devices < 768px, columns collapse to a 1-column vertical stack with 16px side margins.
- **Technical Alignment:** Vertical rhythm is strictly maintained to ensure that monospaced data rows align across adjacent columns.

## Elevation & Depth
In line with the utilitarian aesthetic, this design system avoids heavy shadows and skeuomorphism. Instead, it uses **Tonal Layers and Crisp Outlines**.

- **Surface Tiers:** Backgrounds are slightly off-white (#F9F9F9). Secondary containers (cards, panels) use a pure white background with a 1px solid border (#E0E0E0).
- **Interactive Depth:** When an element is hovered, use a subtle 2px "Soft Bloom" shadow (Primary color at 10% opacity) rather than a generic gray shadow.
- **Active State:** Elements like active input fields or selected cards use a 2px solid border of the Primary Green (#1E4D3B) to provide clear, high-contrast focus.
- **Modals:** Use a heavy background overlay (Rich Black at 40%) to pull focus, with the modal itself having a sharp 1px border.

## Shapes
The shape language is **Soft-Geometric**. By using 0.25rem (4px) as the base radius, the UI feels modern and "engineered" without being harsh or aggressive.

- **Standard Elements:** Buttons, Inputs, and Cards use the 4px radius.
- **Small Elements:** Chips and Badges use a 2px radius for a sharper, more precise look.
- **Large Elements:** Larger containers (Modals, Large Cards) may use up to 8px (`rounded-lg`) to soften the visual impact of large blocks of content.

## Components
- **Buttons:** Primary buttons are Solid Green (#1E4D3B) with White text. Secondary buttons use a Green outline with an Orange (#E89B3C) hover state for the border and text.
- **Input Fields:** Use a 1px #E0E0E0 border with JetBrains Mono for the value entry. On focus, the border shifts to 2px Solid Green.
- **Chips/Tags:** These utilize the JetBrains Mono font at `label-caps` size. Use low-saturation background tints of the semantic colors (e.g., Success Green at 10% opacity) with high-saturation text.
- **Data Tables:** High-density rows (32px height) with subtle horizontal dividers. Alternate row striping is discouraged; use hover highlights instead.
- **Cards:** No shadows. Use 1px solid borders. Headers within cards should have a subtle bottom border to separate controls from content.
- **Status Indicators:** Use small solid circles (8px) using semantic colors next to monospaced IDs to indicate system health or process status.