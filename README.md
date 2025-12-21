# PIA4ROI - First Responder Calculator

A React/Vite/Tailwind calculator for Public Safety leadership.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Run Tests:**
   ```bash
   npm run test      # Unit tests
   npm run test:e2e  # Playwright smoke test
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

## Deploying

### Vercel
1. Connect repo to Vercel.
2. Override build command: `npm run build`.
3. Output directory: `dist`.
4. Ensure Environment Variables are set (see below).

### Firebase Hosting
1. `firebase init hosting`
2. Public directory: `dist`
3. Configure as SPA? Yes.

## Environment Variables
Create a `.env` file for local dev:

```
VITE_LEAD_WEBHOOK_URL=https://hooks.zapier.com/... (Optional)
VITE_STRIPE_PAYMENT_LINK=https://buy.stripe.com/... (Optional)
```

## Where Gemini Apps Usually Break (And How We Avoided It)

1. **Routing on Static Hosts:** 
   - *Pitfall:* Using `BrowserRouter` causes 404s on refresh because `/results` doesn't exist on the file system.
   - *Fix:* We used `HashRouter`. The URL looks like `/#/results`, which is universally supported on S3, Firebase, and Blob storage.

2. **Tailwind in Previews:**
   - *Pitfall:* Complex PostCSS pipelines often fail in simple "code sandbox" previews.
   - *Fix:* We included the Tailwind CDN in `index.html` as a fallback/primary engine for the prototype phase. It works instantly without a build step.

3. **Missing Env Vars:**
   - *Pitfall:* App crashes if a Webhook URL is missing.
   - *Fix:* We implemented explicit `if (webhookUrl)` checks in `Results.tsx` and `DeepDive.tsx` to ensure "Demo Mode" works flawlessly out of the box.

4. **Blob URL Images:**
   - *Pitfall:* Hardcoding local assets (`/src/assets/logo.png`) fails in blob previews.
   - *Fix:* We use `lucide-react` SVGs for all iconography, ensuring zero broken image links.