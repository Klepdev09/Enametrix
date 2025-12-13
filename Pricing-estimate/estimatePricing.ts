// Pricing estimator for Enametrix estimate form
// This function calculates estimated price ranges based on user selections

export type ServiceType = 
  | 'website-creation'
  | 'hipaa-forms'
  | 'local-seo'
  | 'appointment-scheduling'
  | 'review-automation'
  | 'landing-pages'
  | 'virtual-front-desk';

export type WebsitePackage = 'essential' | 'growth' | 'performance';
export type WebsiteTier = 'standard' | 'advanced';

export interface PricingRange {
  min: number;
  max: number;
}

export interface DiscountOption {
  id: string;
  label: string;
  discount: number; // percentage
  description: string;
}

export interface EstimateResult {
  oneTimeRange: PricingRange;
  monthlyRange?: PricingRange;
  recommendedPackageName: string;
  breakdown: Array<{ label: string; value: string }>;
  discountOptions: DiscountOption[];
}

export interface FormState {
  estimateType: 'single' | 'complex' | null;
  // Single service flow
  singleService?: ServiceType;
  singleServiceScope?: Record<string, any>;
  // Complex solution flow
  selectedServices?: ServiceType[];
  locations?: '1' | '2-3' | '4+';
  currentWebsiteStatus?: string;
  hasBrandAssets?: 'yes' | 'some' | 'no';
  mainGoal?: string;
  timeline?: 'asap' | 'standard' | 'flexible';
  schedulingSystem?: string;
  preferredContact?: string;
  // Common
  practiceName?: string;
  websiteUrl?: string;
  cityState?: string;
  email?: string;
  phone?: string;
  // Website tier selection (can be set on results screen)
  websiteTier?: WebsiteTier;
}

// Website package pricing (anchor prices)
const WEBSITE_PRICING: Record<WebsiteTier, Record<WebsitePackage, number>> = {
  standard: {
    essential: 2500,
    growth: 4500,
    performance: 7000,
  },
  advanced: {
    essential: 4500,
    growth: 7500,
    performance: 11000,
  },
};

// Add-on one-time ranges
const ADDON_PRICING: Record<ServiceType, PricingRange> = {
  'website-creation': { min: 0, max: 0 }, // Handled separately
  'hipaa-forms': { min: 600, max: 2500 },
  'local-seo': { min: 800, max: 2500 },
  'review-automation': { min: 300, max: 900 },
  'appointment-scheduling': { min: 400, max: 1200 },
  'landing-pages': { min: 400, max: 1500 }, // per page, default 1
  'virtual-front-desk': { min: 800, max: 2500 },
};

// Monthly ranges
const MONTHLY_PRICING: Record<string, PricingRange> = {
  'local-seo': { min: 750, max: 2500 },
};

/**
 * Determines website package level based on page count
 */
function getWebsitePackage(pages: number): WebsitePackage {
  if (pages <= 5) return 'essential';
  if (pages <= 12) return 'growth';
  return 'performance';
}

/**
 * Gets page count from form state
 */
function getPageCount(state: FormState): number {
  // For single service: website creation
  if (state.estimateType === 'single' && state.singleService === 'website-creation') {
    const pages = state.singleServiceScope?.pages;
    if (pages === '3-5') return 4;
    if (pages === '6-10') return 8;
    if (pages === '10-15') return 12;
    if (pages === '15-20') return 17;
    return 5; // default
  }
  
  // For complex: estimate from selected services or default
  // This is a simplified estimate - in real form, user would specify pages
  if (state.selectedServices?.includes('website-creation')) {
    // Default to growth package if website is selected
    return 8;
  }
  
  return 0;
}

/**
 * Calculates base website price
 */
function getBaseWebsitePrice(state: FormState, tier: WebsiteTier = 'standard'): number {
  if (state.estimateType === 'single' && state.singleService === 'website-creation') {
    const pages = getPageCount(state);
    const packageLevel = getWebsitePackage(pages);
    return WEBSITE_PRICING[tier][packageLevel];
  }
  
  if (state.estimateType === 'complex' && state.selectedServices?.includes('website-creation')) {
    const pages = getPageCount(state);
    const packageLevel = getWebsitePackage(pages);
    return WEBSITE_PRICING[tier][packageLevel];
  }
  
  return 0;
}

/**
 * Calculates add-on prices
 */
function getAddonPrices(state: FormState): { min: number; max: number } {
  let minTotal = 0;
  let maxTotal = 0;
  
  const services = state.estimateType === 'single' 
    ? (state.singleService ? [state.singleService] : [])
    : (state.selectedServices || []);
  
  for (const service of services) {
    if (service === 'website-creation') continue; // Handled separately
    
    const pricing = ADDON_PRICING[service];
    if (pricing) {
      // Special handling for landing pages
      if (service === 'landing-pages') {
        const pageCount = state.singleServiceScope?.pageCount || 1;
        minTotal += pricing.min * pageCount;
        maxTotal += pricing.max * pageCount;
      } else {
        minTotal += pricing.min;
        maxTotal += pricing.max;
      }
    }
  }
  
  return { min: minTotal, max: maxTotal };
}

/**
 * Applies location multiplier
 */
function applyLocationMultiplier(price: PricingRange, locations?: string): PricingRange {
  if (locations === '2-3') {
    return {
      min: Math.round(price.min * 1.15),
      max: Math.round(price.max * 1.15),
    };
  }
  if (locations === '4+') {
    return {
      min: Math.round(price.min * 1.25),
      max: Math.round(price.max * 1.25),
    };
  }
  return price;
}

/**
 * Applies urgency multiplier
 */
function applyUrgencyMultiplier(price: PricingRange, timeline?: string): PricingRange {
  if (timeline === 'asap') {
    return {
      min: Math.round(price.min * 1.1),
      max: Math.round(price.max * 1.1),
    };
  }
  return price;
}

/**
 * Rounds to nearest $50
 */
function roundToNearest50(num: number): number {
  return Math.round(num / 50) * 50;
}

/**
 * Generates recommended package name
 */
function getRecommendedPackageName(state: FormState): string {
  const services = state.estimateType === 'single'
    ? (state.singleService ? [state.singleService] : [])
    : (state.selectedServices || []);
  
  const serviceCount = services.length;
  const hasWebsite = services.includes('website-creation');
  const hasSEO = services.includes('local-seo');
  const hasHIPAA = services.includes('hipaa-forms');
  
  if (serviceCount >= 4) {
    return 'Full Practice System';
  }
  
  if (hasWebsite && hasSEO && hasHIPAA) {
    return 'Website + HIPAA + SEO System';
  }
  
  if (hasWebsite && hasHIPAA && !hasSEO) {
    return 'Compliance + Conversion (Website + HIPAA Forms)';
  }
  
  if (hasWebsite && hasSEO && !hasHIPAA) {
    return 'Growth System (Website + Local SEO)';
  }
  
  if (hasWebsite) {
    return 'Website Creation Package';
  }
  
  // Single service names
  if (state.estimateType === 'single') {
    const serviceNames: Record<ServiceType, string> = {
      'website-creation': 'Website Creation',
      'hipaa-forms': 'HIPAA Forms Setup',
      'local-seo': 'Local SEO Foundation',
      'appointment-scheduling': 'Scheduling Integration',
      'review-automation': 'Review Automation',
      'landing-pages': 'Landing Page Creation',
      'virtual-front-desk': 'Virtual Front Desk',
    };
    return serviceNames[state.singleService!] || 'Custom Solution';
  }
  
  return 'Custom Solution';
}

/**
 * Generates breakdown lines
 */
function getBreakdown(state: FormState, _oneTimeRange: PricingRange, monthlyRange?: PricingRange): Array<{ label: string; value: string }> {
  const breakdown: Array<{ label: string; value: string }> = [];
  
  const services = state.estimateType === 'single'
    ? (state.singleService ? [state.singleService] : [])
    : (state.selectedServices || []);
  
  // Base website
  if (services.includes('website-creation')) {
    const pages = getPageCount(state);
    const packageLevel = getWebsitePackage(pages);
    const tier = state.websiteTier || 'standard';
    const basePrice = WEBSITE_PRICING[tier][packageLevel];
    breakdown.push({
      label: `Website Creation (${packageLevel.charAt(0).toUpperCase() + packageLevel.slice(1)} ${tier})`,
      value: `$${basePrice.toLocaleString()}`,
    });
  }
  
  // Add-ons
  for (const service of services) {
    if (service === 'website-creation') continue;
    
    const pricing = ADDON_PRICING[service];
    if (pricing) {
      const serviceNames: Record<ServiceType, string> = {
        'hipaa-forms': 'HIPAA Forms Setup',
        'local-seo': 'Local SEO Foundation',
        'review-automation': 'Review Automation',
        'appointment-scheduling': 'Scheduling Integration',
        'landing-pages': 'Landing Pages',
        'virtual-front-desk': 'Virtual Front Desk',
        'website-creation': '', // handled above
      };
      
      if (service === 'landing-pages') {
        const pageCount = state.singleServiceScope?.pageCount || 1;
        breakdown.push({
          label: `${serviceNames[service]} (${pageCount} page${pageCount > 1 ? 's' : ''})`,
          value: `$${(pricing.min * pageCount).toLocaleString()}–$${(pricing.max * pageCount).toLocaleString()}`,
        });
      } else {
        breakdown.push({
          label: serviceNames[service],
          value: `$${pricing.min.toLocaleString()}–$${pricing.max.toLocaleString()}`,
        });
      }
    }
  }
  
  // Location multiplier note
  if (state.locations && state.locations !== '1') {
    breakdown.push({
      label: `Multi-location adjustment (${state.locations === '2-3' ? '+15%' : '+25%'})`,
      value: 'Applied',
    });
  }
  
  // Urgency multiplier note
  if (state.timeline === 'asap') {
    breakdown.push({
      label: 'Rush timeline adjustment (+10%)',
      value: 'Applied',
    });
  }
  
  // Monthly
  if (monthlyRange) {
    breakdown.push({
      label: 'Ongoing SEO (monthly)',
      value: `$${monthlyRange.min.toLocaleString()}/mo–$${monthlyRange.max.toLocaleString()}/mo`,
    });
  }
  
  return breakdown;
}

/**
 * Gets discount options based on selections
 */
function getDiscountOptions(state: FormState): DiscountOption[] {
  const options: DiscountOption[] = [];
  
  const services = state.estimateType === 'single'
    ? (state.singleService ? [state.singleService] : [])
    : (state.selectedServices || []);
  
  // Discount 1: Pay upfront (project fee only)
  options.push({
    id: 'pay-upfront',
    label: 'Save 10% when you pay the build upfront (project fee only).',
    discount: 10,
    description: 'Applies to one-time project fees only, not monthly subscriptions.',
  });
  
  // Discount 2: Bundle 3+ services
  if (services.length >= 3) {
    options.push({
      id: 'bundle-services',
      label: 'Save 10% when bundling 3+ services in one build.',
      discount: 10,
      description: 'Applies when selecting 3 or more services in a single project.',
    });
  }
  
  // Discount 3: Prepay 6 months (if monthly exists)
  if (state.selectedServices?.includes('local-seo') || state.singleService === 'local-seo') {
    options.push({
      id: 'prepay-retainer',
      label: 'Save 20% when you prepay 6 months of ongoing optimisation (retainer only).',
      discount: 20,
      description: 'Applies to monthly retainer fees only, requires 6-month prepayment.',
    });
  }
  
  return options;
}

/**
 * Main pricing estimation function
 */
export function estimatePricing(state: FormState): EstimateResult {
  const tier = state.websiteTier || 'standard';
  
  // Calculate base website price
  const baseWebsitePrice = getBaseWebsitePrice(state, tier);
  
  // Calculate add-on prices
  const addonPrices = getAddonPrices(state);
  
  // Combine one-time costs
  let oneTimeMin = baseWebsitePrice + addonPrices.min;
  let oneTimeMax = baseWebsitePrice + addonPrices.max;
  
  // Apply multipliers
  let oneTimeRange = applyLocationMultiplier(
    { min: oneTimeMin, max: oneTimeMax },
    state.locations
  );
  oneTimeRange = applyUrgencyMultiplier(oneTimeRange, state.timeline);
  
  // Round to nearest $50
  oneTimeRange = {
    min: roundToNearest50(oneTimeRange.min),
    max: roundToNearest50(oneTimeRange.max),
  };
  
  // Calculate monthly range (if Local SEO is selected)
  let monthlyRange: PricingRange | undefined;
  const hasSEO = state.estimateType === 'single'
    ? state.singleService === 'local-seo'
    : state.selectedServices?.includes('local-seo');
  
  if (hasSEO) {
    monthlyRange = { ...MONTHLY_PRICING['local-seo'] };
    // Adjust for 4+ locations
    if (state.locations === '4+') {
      monthlyRange = {
        min: Math.round(monthlyRange.min * 1.2),
        max: Math.round(monthlyRange.max * 1.2),
      };
    }
  }
  
  // Generate breakdown
  const breakdown = getBreakdown(state, oneTimeRange, monthlyRange);
  
  // Get recommended package name
  const recommendedPackageName = getRecommendedPackageName(state);
  
  // Get discount options
  const discountOptions = getDiscountOptions(state);
  
  return {
    oneTimeRange,
    monthlyRange,
    recommendedPackageName,
    breakdown,
    discountOptions,
  };
}

