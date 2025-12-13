# Enametrix Pricing Estimate Form

A production-ready multi-step pricing estimate form for Enametrix (dental-focused web agency). Built with React + TypeScript, designed to be embedded into Webflow or run as a standalone route.

## Features

- **Multi-step form** with branching logic (Single Service vs Complex Solution)
- **Dynamic pricing calculation** based on user selections
- **Discount options** with clear rules
- **Responsive design** optimized for mobile
- **Clean, modern UI** using Inter font
- **Type-safe** with TypeScript

## Project Structure

```
Pricing-estimate/
├── EstimateForm.tsx          # Main multi-step form component
├── PricingCtaBlock.tsx       # CTA block component for pricing page
├── estimatePricing.ts        # Pricing calculation logic
├── EstimateForm.module.css   # Form styles
├── PricingCtaBlock.module.css # CTA block styles
├── index.tsx                 # Entry point for standalone use
├── index.html                # HTML template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── vite.config.ts            # Vite build config
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

This will start a development server at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

## Embedding into Webflow

### Option 1: Embed as Script (Recommended)

1. Build the project: `npm run build`
2. Upload the `dist/` folder contents to your hosting/CDN
3. In Webflow, add an Embed element with:

```html
<div id="estimate-form-root"></div>
<script type="module" src="https://your-cdn.com/assets/index.js"></script>
```

### Option 2: Standalone Route

1. Deploy the built files to a subdomain or route (e.g., `enametrix.com/estimate`)
2. Link to it from your Webflow site

### Option 3: Webflow Custom Code

1. Build the project
2. Copy the bundled JavaScript and CSS
3. Add to Webflow Custom Code (Site Settings > Custom Code)
4. Add a div with id `estimate-form-root` where you want the form

## Usage

### Standalone

```tsx
import EstimateForm from './EstimateForm';

function App() {
  return <EstimateForm />;
}
```

### CTA Block Component

```tsx
import PricingCtaBlock from './PricingCtaBlock';

function PricingPage() {
  return (
    <PricingCtaBlock
      estimateFormUrl="/estimate"
      contactUrl="/contact"
    />
  );
}
```

## Form Flow

### Single Service Flow
1. Intro
2. Estimate Type (Single/Complex)
3. Choose Service
4. Service Scope (dynamic questions)
5. Practice Basics
6. **Results Screen**

### Complex Solution Flow
1. Intro
2. Estimate Type (Single/Complex)
3. Select Services (multi-select)
4. Practice Context
5. Goals & Timeline
6. Integrations (optional)
7. Practice Basics
8. **Results Screen**

**Note:** If user selects only 1 service in Complex flow, automatically redirects to Single Service flow.

## Pricing Logic

The pricing estimator (`estimatePricing.ts`) calculates:

- **Base website price** (Standard/Advanced tiers, Essential/Growth/Performance packages)
- **Add-on prices** for each selected service
- **Location multipliers** (2-3 locations: +15%, 4+ locations: +25%)
- **Urgency multipliers** (ASAP: +10%)
- **Monthly ranges** (if Local SEO selected)
- **Discount options** based on selections

## Customization

### Styling

Modify the CSS modules:
- `EstimateForm.module.css` - Form styles
- `PricingCtaBlock.module.css` - CTA block styles

The design uses CSS variables that can be adjusted for your brand colors.

### Pricing Rules

Edit `estimatePricing.ts` to adjust:
- Package pricing
- Add-on ranges
- Multipliers
- Discount rules

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - Enametrix

