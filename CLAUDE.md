# PIA4ROI Calculator v2

Public-safety ROI calculator: helps agency leadership quantify budget drag from
burnout, turnover, overtime, and liability, then model a wellness pilot payback.

## Business facts (canonical — do not paraphrase or re-derive)

- **Business address:** 2700 S Gilbert Rd Ste 5, Chandler, AZ 85286
  - Single source of truth in code: `BUSINESS` in `constants.ts`. Import it;
    never hard-code the address string in a component.
- Contact/owner email: josh@getbuilt.org

## Stack & layout

- React 18 + TypeScript + Vite, React Router, Tailwind (brand palette `brand-*`),
  Recharts for charts, jsPDF for report generation.
- **Flat file layout — no `src/` directory.** All components and modules sit at
  the repo root (`App.tsx`, `calculations.ts`, `constants.ts`, ...).

## Commands

```
npm run dev        # Vite dev server
npm run build      # production build
npm test           # vitest (calculations.test.ts)
npm run test:e2e   # Playwright (e2e.spec.ts)
```

## Domain notes

- `calculations.ts` holds all ROI math; `calculations.test.ts` is the guard on it.
  Changing a multiplier or default means updating the test, not deleting it.
- `constants.ts` holds `DEFAULTS`, `MULTIPLIERS`, `PRESETS`, and the demo profile.
- Demo/mock data is flagged with `isMockData` and renders a DEMO watermark.
  The demo profile describes a *prospect agency*, not our own business.
- `pdfGenerator.ts` builds the Council Readiness Brief; its footer carries a
  legal disclaimer (no guarantee of claim/lawsuit reduction, not legal or
  medical advice). Keep that disclaimer intact.

## Conventions

- Voice matters in outbound copy. The `mailto:` composer in `CouncilReport.tsx`
  is written **in the customer's voice** to *their* finance director — our
  company details do not belong in that signature.
