# Strain Personality Lab design QA

## Evidence

- Reference: `C:/Users/LX/AppData/Local/Temp/codex-clipboard-10ff80a1-96a1-4de6-acf6-a2a6f075f92b.png` (`781×351`), showing the requested Lab Note and footer treatment.
- Desktop implementation: `output/playwright/strain-personality-compact-1024x768.png` at `1024×768`, Full Protocol, EI question 09, response 5 selected.
- Desktop glossary: `output/playwright/strain-personality-glossary-1024x768.png` at `1024×768`, modal open with Biofilm highlighted.
- Mobile implementation: `output/playwright/strain-personality-compact-375x812.png` at `375×812`, the same question and response state.
- Mobile glossary: `output/playwright/strain-personality-glossary-375x812.png` at `375×812`, full-screen glossary open.
- Device scale factor: `1` for all browser captures.

The reference and desktop implementation were inspected together in one comparison pass. The implementation deliberately compresses the reference's tall Lab Note block into a horizontal strip, while retaining its hierarchy, border treatment, blue label/link, and separated action footer. This is the approved deviation required to keep the entire active question and its actions inside the `1024×768` viewport.

## Comparison results

### Fonts and typography

- The implementation preserves the reference hierarchy: monospace blue eyebrow, high-contrast term title, muted supporting copy, and bold action labels.
- English copy is intentional and follows the approved requirement; line lengths remain readable at desktop, tablet, and mobile widths.
- No clipped headings, cramped labels, or broken text wrapping were found.

### Spacing and layout

- Desktop dimensions remain in one row; the question navigator and overall progress share one compact row.
- At `1024×768`, the action footer ends at `738px`, so the current question, 1–7 response controls, Lab Note summary, and actions are visible without routine scrolling.
- At `768×768`, the four dimensions form two rows with no horizontal overflow.
- At `375×812`, the document width equals the client width and all quiz controls remain usable. The mobile question page remains vertically scrollable by design because preserving readable copy and practical tap targets takes precedence over forcing the entire quiz into one phone viewport.

### Colors and surfaces

- GitHub-style light blue, cool gray borders, white cards, blue active states, and muted secondary text are consistent across the quiz and glossary.
- The Lab Note remains visually connected to the question card through a divider rather than an extra nested card.
- The desktop glossary uses a centered modal and dimmed backdrop; the mobile glossary becomes an edge-to-edge layer.

### Image assets and icons

- The reference region contains no required image asset. The implementation does not introduce placeholder imagery, handcrafted SVG substitutes, emoji, or decorative CSS art.
- Existing site-level molecular background and brand assets remain unchanged and render without distortion.
- Text arrows are retained only where they are part of the approved copy treatment, matching the reference interaction labels.

### Copy and content

- Lab Note content is concise, scientific, and understandable in standalone context.
- The glossary exposes the complete set of terms without changing question-bank or scoring data.
- Privacy copy remains explicit: responses are calculated and stored only in the browser.

### States, interaction, and accessibility

- Verified response selection, enabled/disabled primary action, current question, answered question, and current glossary-term states.
- Verified close button, `Escape`, and backdrop dismissal.
- Closing restores focus to `Open the full glossary →`, preserves EI question 09 and response 5, and releases the body scroll lock.
- Native `dialog`, labelled controls, visible focus indicators, semantic buttons, progress labels, and practical mobile targets are present.
- Browser console result: zero errors and zero warnings.

## Comparison history

1. Baseline: the action footer ended at `983px` in a `768px`-high viewport, and the glossary link did not open a dialog.
2. First implementation pass: compact layout and modal were added. QA found a global `footer { margin-top: 4rem; }` rule leaking into the quiz action footer; the component now explicitly resets that margin.
3. Interaction pass: native dialog cancellation was not deterministic in the browser harness, so an explicit document-level Escape handler was added while retaining native dialog behavior.
4. Final pass: desktop, tablet, mobile, dialog states, focus restoration, answer preservation, overflow, and console checks passed with no remaining P0–P2 findings.

final result: passed
