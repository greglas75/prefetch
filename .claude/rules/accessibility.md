# Accessibility Rules (MANDATORY)

Target: **Lighthouse Accessibility 100**. Every element must pass WCAG 2.1 AA.

## Semantic HTML
- Page wrapped in `<main>` landmark (required by Lighthouse).
- Footer uses `<footer>` element, not `<div class="footer">`.
- Steps are `<section>` elements with `aria-label`.
- Card area has `aria-live="polite"` for dynamic content announcements.

## Interactive elements
- All survey options: `role="radio"` with `aria-checked`, `tabindex`, `onkeydown`.
- Options grouped in `role="radiogroup"` with `aria-labelledby` pointing to question text.
- Arrow keys cycle through options. Enter/Space select.
- Selected option gets `tabindex="0"`, others get `tabindex="-1"`.
- All buttons have visible focus: `:focus-visible` outline.

## Progress bar
- `role="progressbar"` with `aria-label="Survey progress"`.
- `aria-valuenow` updated on every step change.
- `aria-valuemin="1"` and `aria-valuemax="3"`.

## Decorative elements
- SVG checkmark: `aria-hidden="true"`.
- Radio dots (`.option-radio`): `aria-hidden="true"`.
- Debug panel: `aria-hidden="true"`.

## Color contrast (WCAG AA)
- Normal text (< 18px): minimum **4.5:1** contrast ratio.
- Large text (>= 18px bold or >= 24px): minimum **3:1**.
- `--muted: #595959` on `--bg: #F5F3F7` = **5.2:1** — passes AA.
- **Never use `opacity` to dim text** — it breaks contrast calculations.
- Always check new colors at https://webaim.org/resources/contrastchecker/
