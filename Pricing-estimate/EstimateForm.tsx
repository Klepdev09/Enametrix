import React, { useState, useCallback } from 'react';
import { estimatePricing, FormState, EstimateResult } from './estimatePricing';
import styles from './EstimateForm.module.css';

// Service options
const SINGLE_SERVICES = [
  { id: 'website-creation', label: 'Dental Website Creation' },
  { id: 'hipaa-forms', label: 'HIPAA-minded Forms' },
  { id: 'local-seo', label: 'Local SEO for Dentists' },
  { id: 'appointment-scheduling', label: 'Appointment Scheduling Integration' },
  { id: 'review-automation', label: 'Review Automation' },
  { id: 'landing-pages', label: 'Landing Page Creation' },
  { id: 'virtual-front-desk', label: 'Virtual Front Desk' },
] as const;

const COMPLEX_SERVICES = [
  { id: 'website-creation', label: 'Website Creation' },
  { id: 'hipaa-forms', label: 'HIPAA-minded Forms' },
  { id: 'local-seo', label: 'Local SEO' },
  { id: 'appointment-scheduling', label: 'Appointment Scheduling Integration' },
  { id: 'review-automation', label: 'Review Automation' },
  { id: 'virtual-front-desk', label: 'Virtual Front Desk' },
  { id: 'landing-pages', label: 'Landing Pages' },
] as const;

interface Step {
  id: string;
  title: string;
  component: React.ReactNode;
  isValid: () => boolean;
}

export default function EstimateForm() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formState, setFormState] = useState<FormState>({
    estimateType: null,
  });
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [startTime] = useState(() => Date.now());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('enx-theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  // Initialize theme on mount
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', theme);
      localStorage.setItem('enx-theme', theme);
    }
  }, [theme]);

  // Auto-save form state to localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined' && formState.estimateType !== null) {
      try {
        localStorage.setItem('enametrix-estimate-form-state', JSON.stringify({
          formState,
          currentStepIndex,
          timestamp: Date.now(),
        }));
      } catch (error) {
        console.warn('Failed to save form state:', error);
      }
    }
  }, [formState, currentStepIndex]);

  // Restore form state on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('enametrix-estimate-form-state');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Only restore if saved within last 24 hours
          if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            setFormState(parsed.formState || { estimateType: null });
            setCurrentStepIndex(parsed.currentStepIndex || 0);
          }
        }
      } catch (error) {
        console.warn('Failed to restore form state:', error);
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Validate email format
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  // Update form state helper
  const updateState = useCallback((updates: Partial<FormState>) => {
    setFormState((prev) => {
      const newState = { ...prev, ...updates };
      // When estimate type changes, move to the appropriate next step
      if (updates.estimateType && updates.estimateType !== prev.estimateType) {
        // Don't reset to 0, stay on current step (step 1 - estimate type)
        // The steps will rebuild and navigation will continue naturally
      }
      // Clear errors when field is updated
      if (updates.practiceName) setFormErrors(prev => ({ ...prev, practiceName: '' }));
      if (updates.email) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          if (updates.email && !validateEmail(updates.email)) {
            newErrors.email = 'Please enter a valid email address';
          } else {
            delete newErrors.email;
          }
          return newErrors;
        });
      }
      if (updates.cityState) setFormErrors(prev => ({ ...prev, cityState: '' }));
      return newState;
    });
  }, [validateEmail]);

  // Calculate estimate
  const calculateEstimate = useCallback(() => {
    const result = estimatePricing(formState);
    setEstimateResult(result);
    setShowResults(true);
  }, [formState]);

  // Step validation
  const validateStep = useCallback((stepId: string): boolean => {
    switch (stepId) {
      case 'intro':
        return true;
      case 'estimate-type':
        return formState.estimateType !== null;
      case 'single-service':
        return !!formState.singleService;
      case 'single-service-scope':
        return true; // Dynamic validation based on service
      case 'complex-services':
        return (formState.selectedServices?.length || 0) > 0;
      case 'complex-context':
        return !!formState.locations && !!formState.currentWebsiteStatus && formState.hasBrandAssets !== undefined;
      case 'complex-goals':
        return !!formState.mainGoal && !!formState.timeline;
      case 'complex-integrations':
        return true; // Optional step
      case 'practice-basics':
        return !!(formState.practiceName && formState.cityState && formState.email);
      default:
        return true;
    }
  }, [formState]);

  // Step components - MUST be defined before buildSteps
  const StepIntro = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Get a Free Estimate</h2>
      <p className={styles.stepHelper}>
        Answer a few short questions and instantly see an estimated range for your project. Absolutely free — no obligation.
      </p>
      <div className={styles.trustBullets}>
        <span>100% free</span>
        <span>·</span>
        <span>No obligation</span>
        <span>·</span>
        <span>Takes ~2 minutes</span>
      </div>
    </div>
  );

  const StepEstimateType = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>What do you need help with?</h2>
      <div className={styles.optionsGrid} role="radiogroup" aria-label="Estimate type selection">
        <label 
          className={`${styles.optionCard} ${formState.estimateType === 'single' ? styles.optionCardSelected : ''}`}
          onClick={(e) => {
            e.preventDefault();
            updateState({ estimateType: 'single' });
          }}
        >
          <input
            type="radio"
            name="estimateType"
            value="single"
            checked={formState.estimateType === 'single'}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateState({ estimateType: e.target.value as 'single' });
            }}
            aria-label="Single service option"
          />
          <div className={styles.optionCardContent}>
            <div className={styles.optionCardTitle}>Single service</div>
          </div>
        </label>
        <label 
          className={`${styles.optionCard} ${formState.estimateType === 'complex' ? styles.optionCardSelected : ''}`}
          onClick={(e) => {
            e.preventDefault();
            updateState({ estimateType: 'complex' });
          }}
        >
          <input
            type="radio"
            name="estimateType"
            value="complex"
            checked={formState.estimateType === 'complex'}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              updateState({ estimateType: e.target.value as 'complex' });
            }}
            aria-label="Complex solution option"
          />
          <div className={styles.optionCardContent}>
            <div className={styles.optionCardTitle}>Complex solution (multiple services)</div>
          </div>
        </label>
      </div>
    </div>
  );

  const StepSingleService = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Choose one service</h2>
      <div className={styles.optionsGrid} role="radiogroup" aria-label="Service selection">
        {SINGLE_SERVICES.map((service) => (
          <label
            key={service.id}
            className={`${styles.optionCard} ${formState.singleService === service.id ? styles.optionCardSelected : ''}`}
          >
            <input
              type="radio"
              name="singleService"
              value={service.id}
              checked={formState.singleService === service.id}
              onChange={(e) => updateState({ singleService: e.target.value as any })}
              aria-label={service.label}
            />
            <div className={styles.optionCardContent}>
              <div className={styles.optionCardTitle}>{service.label}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const StepSingleServiceScope = () => {
    const service = formState.singleService;
    if (!service) return null;

    if (service === 'website-creation') {
      return (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Tell us about your website</h2>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Number of pages</label>
            <div className={styles.optionsGrid}>
              {['3-5', '6-10', '10-15', '15-20'].map((val) => (
                <label
                  key={val}
                  className={`${styles.optionCard} ${formState.singleServiceScope?.pages === val ? styles.optionCardSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="pages"
                    value={val}
                    checked={formState.singleServiceScope?.pages === val}
                    onChange={(e) => updateState({
                      singleServiceScope: { ...formState.singleServiceScope, pages: e.target.value },
                    })}
                  />
                  <div className={styles.optionCardContent}>
                    <div className={styles.optionCardTitle}>{val}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Content ready?</label>
            <div className={styles.optionsGrid}>
              {['Yes', 'Some', 'No'].map((val) => (
                <label
                  key={val}
                  className={`${styles.optionCard} ${formState.singleServiceScope?.contentReady === val ? styles.optionCardSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="contentReady"
                    value={val}
                    checked={formState.singleServiceScope?.contentReady === val}
                    onChange={(e) => updateState({
                      singleServiceScope: { ...formState.singleServiceScope, contentReady: e.target.value },
                    })}
                  />
                  <div className={styles.optionCardContent}>
                    <div className={styles.optionCardTitle}>{val}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Booking embed needed?</label>
            <div className={styles.optionsGrid}>
              {['Yes', 'No'].map((val) => (
                <label
                  key={val}
                  className={`${styles.optionCard} ${formState.singleServiceScope?.bookingEmbed === val ? styles.optionCardSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="bookingEmbed"
                    value={val}
                    checked={formState.singleServiceScope?.bookingEmbed === val}
                    onChange={(e) => updateState({
                      singleServiceScope: { ...formState.singleServiceScope, bookingEmbed: e.target.value },
                    })}
                  />
                  <div className={styles.optionCardContent}>
                    <div className={styles.optionCardTitle}>{val}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (service === 'hipaa-forms') {
      return (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Tell us about your forms</h2>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Number of forms</label>
            <div className={styles.optionsGrid}>
              {['1-2', '3-5', '6+'].map((val) => (
                <label
                  key={val}
                  className={`${styles.optionCard} ${formState.singleServiceScope?.formCount === val ? styles.optionCardSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="formCount"
                    value={val}
                    checked={formState.singleServiceScope?.formCount === val}
                    onChange={(e) => updateState({
                      singleServiceScope: { ...formState.singleServiceScope, formCount: e.target.value },
                    })}
                  />
                  <div className={styles.optionCardContent}>
                    <div className={styles.optionCardTitle}>{val}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Form routing</label>
            <div className={styles.optionsGrid}>
              {['Email', 'Secure endpoint', 'CRM', 'Scheduling'].map((val) => (
                <label
                  key={val}
                  className={`${styles.optionCard} ${formState.singleServiceScope?.routing === val ? styles.optionCardSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="routing"
                    value={val}
                    checked={formState.singleServiceScope?.routing === val}
                    onChange={(e) => updateState({
                      singleServiceScope: { ...formState.singleServiceScope, routing: e.target.value },
                    })}
                  />
                  <div className={styles.optionCardContent}>
                    <div className={styles.optionCardTitle}>{val}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (service === 'local-seo') {
      return (
        <div className={styles.stepContent}>
          <h2 className={styles.stepTitle}>Tell us about your SEO needs</h2>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Number of locations</label>
            <div className={styles.optionsGrid}>
              {['1', '2-3', '4+'].map((val) => (
                <label
                  key={val}
                  className={`${styles.optionCard} ${formState.singleServiceScope?.locations === val ? styles.optionCardSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="locations"
                    value={val}
                    checked={formState.singleServiceScope?.locations === val}
                    onChange={(e) => updateState({
                      singleServiceScope: { ...formState.singleServiceScope, locations: e.target.value },
                      locations: e.target.value as any,
                    })}
                  />
                  <div className={styles.optionCardContent}>
                    <div className={styles.optionCardTitle}>{val}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Main goal</label>
            <div className={styles.optionsGrid}>
              {['More calls', 'More bookings', 'Rank for services'].map((val) => (
                <label
                  key={val}
                  className={`${styles.optionCard} ${formState.singleServiceScope?.goal === val ? styles.optionCardSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="goal"
                    value={val}
                    checked={formState.singleServiceScope?.goal === val}
                    onChange={(e) => updateState({
                      singleServiceScope: { ...formState.singleServiceScope, goal: e.target.value },
                    })}
                  />
                  <div className={styles.optionCardContent}>
                    <div className={styles.optionCardTitle}>{val}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Have Google Business Profile?</label>
            <div className={styles.optionsGrid}>
              {['Yes', 'No'].map((val) => (
                <label
                  key={val}
                  className={`${styles.optionCard} ${formState.singleServiceScope?.hasGBP === val ? styles.optionCardSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="hasGBP"
                    value={val}
                    checked={formState.singleServiceScope?.hasGBP === val}
                    onChange={(e) => updateState({
                      singleServiceScope: { ...formState.singleServiceScope, hasGBP: e.target.value },
                    })}
                  />
                  <div className={styles.optionCardContent}>
                    <div className={styles.optionCardTitle}>{val}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Default scope step for other services
    return (
      <div className={styles.stepContent}>
        <h2 className={styles.stepTitle}>Service details</h2>
        <p className={styles.stepHelper}>We'll gather more details in the next step.</p>
      </div>
    );
  };

  const StepComplexServices = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>What should be included?</h2>
      <p className={styles.stepHelper}>Select all that apply</p>
      <div className={styles.optionsGrid} role="group" aria-label="Service selection">
        {COMPLEX_SERVICES.map((service) => (
          <label
            key={service.id}
            className={`${styles.optionCard} ${formState.selectedServices?.includes(service.id as any) ? styles.optionCardSelected : ''}`}
          >
            <input
              type="checkbox"
              checked={formState.selectedServices?.includes(service.id as any) || false}
              onChange={(e) => {
                e.preventDefault();
                const current = formState.selectedServices || [];
                if (e.target.checked) {
                  updateState({ selectedServices: [...current, service.id as any] });
                } else {
                  updateState({ selectedServices: current.filter(s => s !== service.id) });
                }
              }}
              aria-label={service.label}
            />
            <div className={styles.optionCardContent}>
              <div className={styles.optionCardTitle}>{service.label}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const StepComplexContext = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Practice context</h2>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Number of locations</label>
        <div className={styles.optionsGrid}>
          {['1', '2-3', '4+'].map((val) => (
            <label
              key={val}
              className={`${styles.optionCard} ${formState.locations === val ? styles.optionCardSelected : ''}`}
            >
              <input
                type="radio"
                name="locations"
                value={val}
                checked={formState.locations === val}
                onChange={(e) => updateState({ locations: e.target.value as any })}
              />
              <div className={styles.optionCardContent}>
                <div className={styles.optionCardTitle}>{val}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Current website status</label>
        <div className={styles.optionsGrid}>
          {['No website', 'Old needs redesign', 'Decent but not converting'].map((val) => (
            <label
              key={val}
              className={`${styles.optionCard} ${formState.currentWebsiteStatus === val ? styles.optionCardSelected : ''}`}
            >
              <input
                type="radio"
                name="currentWebsiteStatus"
                value={val}
                checked={formState.currentWebsiteStatus === val}
                onChange={(e) => updateState({ currentWebsiteStatus: e.target.value })}
              />
              <div className={styles.optionCardContent}>
                <div className={styles.optionCardTitle}>{val}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Brand assets available?</label>
        <div className={styles.optionsGrid}>
          {['Yes', 'Some', 'No'].map((val) => (
            <label
              key={val}
              className={`${styles.optionCard} ${formState.hasBrandAssets === val.toLowerCase() ? styles.optionCardSelected : ''}`}
            >
              <input
                type="radio"
                name="hasBrandAssets"
                value={val.toLowerCase()}
                checked={formState.hasBrandAssets === val.toLowerCase()}
                onChange={(e) => updateState({ hasBrandAssets: e.target.value as any })}
              />
              <div className={styles.optionCardContent}>
                <div className={styles.optionCardTitle}>{val}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const StepComplexGoals = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Goals & timeline</h2>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Main goal</label>
        <div className={styles.optionsGrid}>
          {['Get more new patients', 'Improve conversions', 'Reduce front desk workload', 'Fix compliance trust'].map((val) => (
            <label
              key={val}
              className={`${styles.optionCard} ${formState.mainGoal === val ? styles.optionCardSelected : ''}`}
            >
              <input
                type="radio"
                name="mainGoal"
                value={val}
                checked={formState.mainGoal === val}
                onChange={(e) => updateState({ mainGoal: e.target.value })}
              />
              <div className={styles.optionCardContent}>
                <div className={styles.optionCardTitle}>{val}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Timeline</label>
        <div className={styles.optionsGrid}>
          {[
            { value: 'asap', label: 'ASAP (2–4 weeks)' },
            { value: 'standard', label: 'Standard (1–2 months)' },
            { value: 'flexible', label: 'Flexible' },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`${styles.optionCard} ${formState.timeline === opt.value ? styles.optionCardSelected : ''}`}
            >
              <input
                type="radio"
                name="timeline"
                value={opt.value}
                checked={formState.timeline === opt.value}
                onChange={(e) => updateState({ timeline: e.target.value as any })}
              />
              <div className={styles.optionCardContent}>
                <div className={styles.optionCardTitle}>{opt.label}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const StepComplexIntegrations = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Integrations (optional)</h2>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Scheduling system</label>
        <div className={styles.optionsGrid}>
          {['None', 'NexHealth', 'Solutionreach', 'Other'].map((val) => (
            <label
              key={val}
              className={`${styles.optionCard} ${formState.schedulingSystem === val ? styles.optionCardSelected : ''}`}
            >
              <input
                type="radio"
                name="schedulingSystem"
                value={val}
                checked={formState.schedulingSystem === val}
                onChange={(e) => updateState({ schedulingSystem: e.target.value })}
              />
              <div className={styles.optionCardContent}>
                <div className={styles.optionCardTitle}>{val}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Preferred contact</label>
        <div className={styles.optionsGrid}>
          {['Email', 'Phone'].map((val) => (
            <label
              key={val}
              className={`${styles.optionCard} ${formState.preferredContact === val ? styles.optionCardSelected : ''}`}
            >
              <input
                type="radio"
                name="preferredContact"
                value={val}
                checked={formState.preferredContact === val}
                onChange={(e) => updateState({ preferredContact: e.target.value })}
              />
              <div className={styles.optionCardContent}>
                <div className={styles.optionCardTitle}>{val}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const StepPracticeBasics = () => (
    <div className={styles.stepContent}>
      <h2 className={styles.stepTitle}>Practice basics</h2>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Practice name *</label>
        <input
          type="text"
          className={styles.formInput}
          value={formState.practiceName || ''}
          onChange={(e) => {
            e.preventDefault();
            updateState({ practiceName: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          placeholder="Bright Smile Dental"
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Website (if existing) <span className={styles.optional}>(optional)</span></label>
        <input
          type="url"
          className={styles.formInput}
          value={formState.websiteUrl || ''}
          onChange={(e) => {
            e.preventDefault();
            updateState({ websiteUrl: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          placeholder="https://yourpractice.com"
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>City & State *</label>
        <input
          type="text"
          className={styles.formInput}
          value={formState.cityState || ''}
          onChange={(e) => {
            e.preventDefault();
            updateState({ cityState: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          placeholder="Boston, MA"
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel} htmlFor="email-input">Email *</label>
        <input
          id="email-input"
          type="email"
          className={`${styles.formInput} ${formErrors.email ? styles.formInputError : ''}`}
          value={formState.email || ''}
          onChange={(e) => {
            e.preventDefault();
            updateState({ email: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          placeholder="office@yourpractice.com"
          required
          aria-invalid={!!formErrors.email}
          aria-describedby={formErrors.email ? 'email-error' : undefined}
        />
        {formErrors.email && (
          <span id="email-error" className={styles.formError} role="alert">
            {formErrors.email}
          </span>
        )}
      </div>
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>Phone <span className={styles.optional}>(optional)</span></label>
        <input
          type="tel"
          className={styles.formInput}
          value={formState.phone || ''}
          onChange={(e) => {
            e.preventDefault();
            updateState({ phone: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          placeholder="+1 (555) 123-4567"
        />
      </div>
    </div>
  );

  // Build steps array based on flow
  const buildSteps = useCallback((): Step[] => {
    const baseSteps: Step[] = [
      {
        id: 'intro',
        title: 'Get Started',
        component: <StepIntro />,
        isValid: () => true,
      },
      {
        id: 'estimate-type',
        title: 'Estimate Type',
        component: <StepEstimateType />,
        isValid: () => validateStep('estimate-type'),
      },
    ];

    if (formState.estimateType === 'single') {
      baseSteps.push(
        {
          id: 'single-service',
          title: 'Choose Service',
          component: <StepSingleService />,
          isValid: () => validateStep('single-service'),
        },
        {
          id: 'single-service-scope',
          title: 'Service Details',
          component: <StepSingleServiceScope />,
          isValid: () => validateStep('single-service-scope'),
        },
        {
          id: 'practice-basics',
          title: 'Practice Basics',
          component: <StepPracticeBasics />,
          isValid: () => validateStep('practice-basics'),
        }
      );
    } else if (formState.estimateType === 'complex') {
      baseSteps.push(
        {
          id: 'complex-services',
          title: 'Select Services',
          component: <StepComplexServices />,
          isValid: () => validateStep('complex-services'),
        },
        {
          id: 'complex-context',
          title: 'Practice Context',
          component: <StepComplexContext />,
          isValid: () => validateStep('complex-context'),
        },
        {
          id: 'complex-goals',
          title: 'Goals & Timeline',
          component: <StepComplexGoals />,
          isValid: () => validateStep('complex-goals'),
        },
        {
          id: 'complex-integrations',
          title: 'Integrations',
          component: <StepComplexIntegrations />,
          isValid: () => validateStep('complex-integrations'),
        },
        {
          id: 'practice-basics',
          title: 'Practice Basics',
          component: <StepPracticeBasics />,
          isValid: () => validateStep('practice-basics'),
        }
      );
    }

    return baseSteps;
  }, [formState, validateStep]);

  // Rebuild steps when formState changes, but keep current step index if valid
  const steps = buildSteps();
  
  // Ensure current step index is valid after steps rebuild
  React.useEffect(() => {
    if (currentStepIndex >= steps.length) {
      // If current index is out of bounds, go to the last step
      setCurrentStepIndex(Math.max(0, steps.length - 1));
    }
  }, [steps.length, currentStepIndex]);

  // Navigation
  const nextStep = useCallback(() => {
    const currentStep = steps[currentStepIndex];
    if (currentStep && !currentStep.isValid()) {
      return;
    }

    // Special logic: if complex solution with only 1 service, redirect to single flow
    if (currentStep?.id === 'complex-services' && formState.selectedServices?.length === 1) {
      updateState({
        estimateType: 'single',
        singleService: formState.selectedServices[0],
        selectedServices: undefined,
      });
      // Rebuild steps and find single-service-scope step
      const newSteps = buildSteps();
      const scopeIndex = newSteps.findIndex(s => s.id === 'single-service-scope');
      if (scopeIndex >= 0) {
        setCurrentStepIndex(scopeIndex);
        return;
      }
    }

    // Check if we should show results
    if (currentStep?.id === 'practice-basics') {
      calculateEstimate();
      return;
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex, formState, steps, updateState, calculateEstimate, buildSteps]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  // Submit estimate to Formspark
  const handleEmailEstimate = useCallback(async (selectedDiscounts: string[] = []) => {
    if (!estimateResult) {
      setSubmitError('Estimate data is missing. Please complete the form again.');
      return;
    }

    // Validate email
    if (!formState.email) {
      setFormErrors(prev => ({ ...prev, email: 'Email is required' }));
      setSubmitError('Please provide your email address.');
      return;
    }

    if (!validateEmail(formState.email)) {
      setFormErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
      setSubmitError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Prepare form data
    const formData = {
      // Practice info
      practice_name: formState.practiceName || '',
      website_url: formState.websiteUrl || '',
      city_state: formState.cityState || '',
      email: formState.email || '',
      phone: formState.phone || '',
      
      // Estimate details
      estimate_type: formState.estimateType || '',
      single_service: formState.singleService || '',
      selected_services: formState.selectedServices?.join(', ') || '',
      locations: formState.locations || '',
      timeline: formState.timeline || '',
      website_tier: formState.websiteTier || 'standard',
      
      // Pricing
      one_time_min: estimateResult.oneTimeRange.min,
      one_time_max: estimateResult.oneTimeRange.max,
      monthly_min: estimateResult.monthlyRange?.min || 0,
      monthly_max: estimateResult.monthlyRange?.max || 0,
      recommended_package: estimateResult.recommendedPackageName,
      selected_discounts: selectedDiscounts.join(', '),
      
      // Breakdown
      breakdown: estimateResult.breakdown.map(item => `${item.label}: ${item.value}`).join(' | '),
      
      // Form metadata
      form_type: 'pricing_estimate',
      timestamp: new Date().toISOString(),
      time_spent_seconds: Math.round((Date.now() - startTime) / 1000),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screen_resolution: typeof window !== 'undefined' 
        ? `${window.innerWidth}x${window.innerHeight}` 
        : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    };

    try {
      const response = await fetch('https://submit-form.com/1iyxMKdoJ', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Form submission failed');
      }

      // Clear saved form state on success
      if (typeof window !== 'undefined') {
        localStorage.removeItem('enametrix-estimate-form-state');
      }

      // Show success screen
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting estimate:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'There was an error sending your estimate. Please check your connection and try again.';
      setSubmitError(errorMessage);
      
      // Retry option after 3 seconds
      setTimeout(() => {
        setSubmitError(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  }, [estimateResult, formState, validateEmail]);

  // Results screen component
  const ResultsScreen = () => {
    if (!estimateResult) return null;

    const [selectedDiscounts, setSelectedDiscounts] = useState<string[]>([]);
    const [websiteTier, setWebsiteTier] = useState<'standard' | 'advanced'>('standard');

    // Recalculate if tier changes
    React.useEffect(() => {
      if (websiteTier !== formState.websiteTier) {
        const updatedState = { ...formState, websiteTier };
        updateState({ websiteTier });
        const newResult = estimatePricing(updatedState);
        setEstimateResult(newResult);
      }
    }, [websiteTier, formState, updateState]);

    // Calculate discounted price with multiple discounts
    const getDiscountedPrice = (range: { min: number; max: number }, discounts: string[]) => {
      if (discounts.length === 0) return range;
      
      // Apply the highest discount only (as per requirements: "Discounts can't be combined")
      const discountOptions = estimateResult.discountOptions.filter(opt => discounts.includes(opt.id));
      const maxDiscount = discountOptions.length > 0 
        ? Math.max(...discountOptions.map(opt => opt.discount))
        : 0;
      
      return {
        min: Math.round(range.min * (1 - maxDiscount / 100)),
        max: Math.round(range.max * (1 - maxDiscount / 100)),
      };
    };

    const oneTimeRange = getDiscountedPrice(estimateResult.oneTimeRange, selectedDiscounts);
    const monthlyRange = estimateResult.monthlyRange
      ? (selectedDiscounts.includes('prepay-retainer')
          ? getDiscountedPrice(estimateResult.monthlyRange, ['prepay-retainer'])
          : estimateResult.monthlyRange)
      : undefined;

    return (
      <div className={styles.resultsScreen}>
        <div className={styles.resultsHeader}>
          <h2 className={styles.resultsTitle}>Your Estimated Range</h2>
          <p className={styles.resultsSubtitle}>{estimateResult.recommendedPackageName}</p>
        </div>

        <div className={styles.pricingDisplay}>
          <div className={styles.pricingItem}>
            <div className={styles.pricingLabel}>One-time</div>
            <div className={styles.pricingValue}>
              ${oneTimeRange.min.toLocaleString()} – ${oneTimeRange.max.toLocaleString()}
            </div>
          </div>
          {monthlyRange && (
            <div className={styles.pricingItem}>
              <div className={styles.pricingLabel}>Monthly</div>
              <div className={styles.pricingValue}>
                ${monthlyRange.min.toLocaleString()}/mo – ${monthlyRange.max.toLocaleString()}/mo
              </div>
            </div>
          )}
        </div>

        {formState.selectedServices?.includes('website-creation') || formState.singleService === 'website-creation' ? (
          <div className={styles.tierSelector}>
            <label className={styles.formLabel}>Website tier</label>
            <div className={styles.optionsGrid}>
              <label 
                className={`${styles.optionCard} ${websiteTier === 'standard' ? styles.optionCardSelected : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setWebsiteTier('standard');
                }}
              >
                <input
                  type="radio"
                  name="websiteTier"
                  value="standard"
                  checked={websiteTier === 'standard'}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setWebsiteTier(e.target.value as any);
                  }}
                />
                <div className={styles.optionCardContent}>
                  <div className={styles.optionCardTitle}>Standard</div>
                  <div className={styles.optionCardDescription}>
                    Clean, modern template with customization. Perfect for most dental practices.
                  </div>
                </div>
              </label>
              <label 
                className={`${styles.optionCard} ${websiteTier === 'advanced' ? styles.optionCardSelected : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setWebsiteTier('advanced');
                }}
              >
                <input
                  type="radio"
                  name="websiteTier"
                  value="advanced"
                  checked={websiteTier === 'advanced'}
                  onChange={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setWebsiteTier(e.target.value as any);
                  }}
                />
                <div className={styles.optionCardContent}>
                  <div className={styles.optionCardTitle}>Advanced</div>
                  <div className={styles.optionCardDescription}>
                    Fully custom design with premium animations. Available upon request.
                  </div>
                </div>
              </label>
            </div>
          </div>
        ) : null}

        <div className={styles.breakdown}>
          <h3 className={styles.breakdownTitle}>Included</h3>
          <ul className={styles.breakdownList}>
            {estimateResult.breakdown.map((item, idx) => (
              <li key={idx} className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>{item.label}</span>
                <span className={styles.breakdownValue}>{item.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {estimateResult.discountOptions.length > 0 && (
          <div className={styles.discountSection}>
            <h3 className={styles.discountTitle}>Available discounts</h3>
            <div className={styles.discountOptions}>
              {estimateResult.discountOptions.map((option) => (
                <label key={option.id} className={styles.discountOption}>
                  <input
                    type="checkbox"
                    checked={selectedDiscounts.includes(option.id)}
                    onChange={(e) => {
                      e.preventDefault();
                      if (e.target.checked) {
                        setSelectedDiscounts([...selectedDiscounts, option.id]);
                      } else {
                        setSelectedDiscounts(selectedDiscounts.filter(id => id !== option.id));
                      }
                    }}
                  />
                  <div className={styles.discountContent}>
                    <div className={styles.discountLabel}>{option.label}</div>
                    <div className={styles.discountDescription}>{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
            <p className={styles.discountNote}>
              Discounts apply to Enametrix service fees only (not third-party subscriptions). When multiple discounts are selected, only the highest discount applies.
            </p>
          </div>
        )}

        <div className={styles.disclaimer}>
          <p>
            This estimate is a starting range, not a final quote. Final pricing depends on scope (pages, locations, integrations, content readiness) and is confirmed after a quick discovery call.
          </p>
        </div>

        {submitError && (
          <div className={styles.errorMessage} role="alert">
            <strong>Error:</strong> {submitError}
            <button
              type="button"
              className={styles.errorDismiss}
              onClick={() => setSubmitError(null)}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        <div className={styles.resultsActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => handleEmailEstimate(selectedDiscounts)}
            disabled={isSubmitting || !formState.email}
            aria-label="Email estimate to your email address"
          >
            {isSubmitting ? 'Sending...' : 'Email me this estimate'}
          </button>
          <a
            href="https://enametrix.com"
            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLink}`}
            aria-label="Return to Enametrix homepage"
          >
            Return to homepage
          </a>
        </div>

        <div className={styles.freeBadge}>
          <span>100% free</span>
        </div>
      </div>
    );
  };

  const currentStep = steps[currentStepIndex];

  // Success screen
  if (showSuccess) {
    return (
      <div className={styles.resultsContainer}>
        <div className={styles.successScreen}>
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>Your estimate has been sent!</h2>
          <p className={styles.successText}>
            We've sent your <strong>free estimate</strong> to <strong>{formState.email}</strong>.
          </p>
          <p className={styles.successText}>
            You'll also hear from Enametrix within <strong>1 business day</strong> with next steps.
          </p>
          <div className={styles.successActions}>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => {
                setShowSuccess(false);
                setShowResults(false);
                setCurrentStepIndex(0);
                setFormState({ estimateType: null });
                setEstimateResult(null);
              }}
            >
              Start New Estimate
            </button>
            <a
              href="https://enametrix.com"
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              Return to Homepage
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && estimateResult) {
    return (
      <div className={styles.resultsContainer}>
        <ResultsScreen />
      </div>
    );
  }

  // Calculate progress percentage
  const progressPercentage = steps.length > 0 
    ? Math.round(((currentStepIndex + 1) / steps.length) * 100)
    : 0;

  return (
    <div className={styles.formContainer}>
      {/* Theme Toggle */}
      <div 
        className={styles.themeToggle} 
        onClick={toggleTheme} 
        role="button" 
        tabIndex={0} 
        aria-label="Toggle theme"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
          }
        }}
      >
        <span className={styles.themeToggleLabel} style={{ opacity: theme === 'dark' ? 1 : 0.5 }}>Dark</span>
        <div className={styles.themeToggleSwitch} style={{
          background: theme === 'light' ? '#4ECDC4' : 'rgba(255, 255, 255, 0.12)',
        }}>
          <div style={{
            transform: theme === 'light' ? 'translateX(24px)' : 'translateX(2px)',
            transition: 'transform 0.3s ease',
            position: 'absolute',
            top: '2px',
            left: '2px',
            width: '20px',
            height: '20px',
            background: theme === 'light' ? '#0A2540' : '#ffffff',
            borderRadius: '50%',
          }} />
        </div>
        <span className={styles.themeToggleLabel} style={{ opacity: theme === 'light' ? 1 : 0.5 }}>Light</span>
      </div>
      
      <div className={styles.logoContainer}>
        <img 
          src="https://cdn.prod.website-files.com/6907ae5897c5c1e84efa6717/6907b19cc606f8f089d0815b_Logo.svg" 
          alt="Enametrix" 
          className={styles.logo}
        />
      </div>
      
      {/* Progress Indicator */}
      {currentStep && currentStepIndex > 0 && (
        <div className={styles.progressBar}>
          <div className={styles.progressBarTrack}>
            <div 
              className={styles.progressBarFill} 
              style={{ width: `${progressPercentage}%` }}
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Form progress: ${progressPercentage}%`}
            />
          </div>
          <div className={styles.progressText}>
            Step {currentStepIndex + 1} of {steps.length} ({progressPercentage}%)
          </div>
        </div>
      )}

      <div className={styles.formWrapper}>
        {currentStep?.component}
        {currentStep && (
          <div className={styles.formActions}>
            {currentStepIndex > 0 && (
              <button 
                type="button" 
                className={`${styles.btn} ${styles.btnSecondary}`} 
                onClick={prevStep}
                aria-label="Go to previous step"
              >
                Back
              </button>
            )}
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={nextStep}
              disabled={!currentStep.isValid()}
              aria-label={currentStepIndex === steps.length - 1 ? 'Calculate estimate' : 'Go to next step'}
            >
              {currentStepIndex === steps.length - 1 ? 'Get Estimate' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

