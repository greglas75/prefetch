# Color Scheme — TGM Panel (LOCKED)

These colors match the TGM Panel brand. Do NOT change without explicit approval.

```css
:root {
  --bg: #F5F3F7;          /* light purple tint — page background */
  --card: #FFFFFF;         /* white — card background */
  --text: #1A1A1A;         /* near-black — primary text */
  --muted: #595959;        /* dark gray — secondary text (WCAG AA on --bg) */
  --accent: #7B2D8E;       /* purple — progress dots, labels, radio selection */
  --accent-light: #F3E5F5; /* light purple — selected option background */
  --accent-hover: #5E1A6E; /* dark purple — accent hover state */
  --cta: #E91E63;          /* pink/crimson — primary action buttons */
  --cta-hover: #C2185B;    /* dark pink — button hover state */
  --border: #E0D8E5;       /* purple-gray — borders and dividers */
}
```

## Usage
| Variable | Where used |
|----------|-----------|
| `--accent` | Progress dots, step labels, radio borders, focus rings |
| `--cta` | "Start Survey", "Next", "Submit" buttons |
| `--accent-light` | Selected option background, hover option background |
| `--muted` | Subtitles, footer text, disabled button text |
| `--border` | Card border, option borders, disabled button background |

## Rules
- Never add new color variables without checking contrast ratios.
- CTA buttons use `--cta`, NOT `--accent`. They are different intentionally.
- Disabled buttons: `background: var(--border)`, `color: var(--muted)`.
