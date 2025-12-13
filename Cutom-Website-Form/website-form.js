let currentStep = 1;
const totalSteps = 9;
const completedSteps = new Set();

const stepInfo = {
  1: { number: 1, title: 'Practice Basics', helper: 'Step 1 of 9' },
  2: { number: 2, title: 'Website Goal', helper: 'Step 2 of 9' },
  3: { number: 3, title: 'Current Situation', helper: 'Step 3 of 9' },
  4: { number: 4, title: 'Pages & Structure', helper: 'Step 4 of 9' },
  5: { number: 5, title: 'Features & Functionality', helper: 'Step 5 of 9' },
  6: { number: 6, title: 'Design Expectations', helper: 'Step 6 of 9' },
  7: { number: 7, title: 'Timeline', helper: 'Step 7 of 9' },
  8: { number: 8, title: 'Budget Range', helper: 'Step 8 of 9' },
  9: { number: 9, title: 'Contact Details', helper: 'Step 9 of 9' }
};

function updateSidebarProgress() {
  document.querySelectorAll('.enx-step-item').forEach((item, index) => {
    const stepNum = index + 1;
    item.classList.remove('enx-step-item--active', 'enx-step-item--completed');
    
    if (stepNum < currentStep) {
      item.classList.add('enx-step-item--completed');
    } else if (stepNum === currentStep) {
      item.classList.add('enx-step-item--active');
    }
  });
}

function updateMobileStepIndicator(step) {
  const info = stepInfo[step];
  if (info) {
    const numberEl = document.getElementById('mobile-step-number');
    const titleEl = document.getElementById('mobile-step-title');
    const helperEl = document.getElementById('mobile-step-helper');
    if (numberEl) numberEl.textContent = info.number;
    if (titleEl) titleEl.textContent = info.title;
    if (helperEl) helperEl.textContent = info.helper;
  }
}

function showStep(step) {
  document.querySelectorAll('.enx-step').forEach(s => {
    s.classList.remove('enx-step--active');
    s.style.display = 'none';
  });
  
  const stepElement = document.querySelector(`.enx-step[data-step="${step}"]`);
  if (stepElement) {
    stepElement.classList.add('enx-step--active');
    stepElement.style.display = 'block';
  } else {
    console.error('Step element not found:', step);
  }
  
  if (currentStep > 1) {
    for (let i = 1; i < currentStep; i++) {
      completedSteps.add(i);
    }
  }
  
  updateSidebarProgress();
  updateMobileStepIndicator(step);
  
  // Initialize budget display when step 8 is shown
  if (step === 8) {
    setTimeout(initBudgetDisplay, 100);
  }
  
  // Handle conditional logic for location pages and page count
  if (step === 4) {
    setTimeout(() => {
      handleLocationPagesToggle();
      handlePageCountToggle();
    }, 100);
  }
  
  // Scroll to top on step change
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleLocationPagesToggle() {
  const locationInputs = document.querySelectorAll('input[name="locations"]');
  const locationPagesToggle = document.getElementById('location-pages-toggle');
  
  locationInputs.forEach(input => {
    input.addEventListener('change', () => {
      const selectedValue = document.querySelector('input[name="locations"]:checked')?.value;
      if (locationPagesToggle) {
        if (selectedValue === '2-3' || selectedValue === '4+') {
          locationPagesToggle.style.display = 'block';
        } else {
          locationPagesToggle.style.display = 'none';
          // Uncheck location pages if single location
          const locationPagesCheckbox = locationPagesToggle.querySelector('input[type="checkbox"]');
          if (locationPagesCheckbox) {
            locationPagesCheckbox.checked = false;
          }
        }
      }
    });
  });
  
  // Check initial state
  const selectedValue = document.querySelector('input[name="locations"]:checked')?.value;
  if (locationPagesToggle) {
    if (selectedValue === '2-3' || selectedValue === '4+') {
      locationPagesToggle.style.display = 'block';
    } else {
      locationPagesToggle.style.display = 'none';
    }
  }
}

function handlePageCountToggle() {
  const pageCheckboxes = document.querySelectorAll('input[name="pages"]');
  const pageCountGroup = document.getElementById('page-count-group');
  
  pageCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const checkedPages = document.querySelectorAll('input[name="pages"]:checked');
      if (pageCountGroup) {
        if (checkedPages.length > 0) {
          pageCountGroup.style.display = 'block';
        } else {
          pageCountGroup.style.display = 'none';
        }
      }
    });
  });
  
  // Check initial state
  const checkedPages = document.querySelectorAll('input[name="pages"]:checked');
  if (pageCountGroup) {
    if (checkedPages.length > 0) {
      pageCountGroup.style.display = 'block';
    } else {
      pageCountGroup.style.display = 'none';
    }
  }
}

function nextStep() {
  const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
  if (!currentStepElement) {
    return;
  }
  
  // Validate current step
  const form = currentStepElement.querySelector('form');
  if (form) {
    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reportValidity();
      return;
    }
  }
  
  // Special validation for step 1 - check if at least one practice type is selected
  if (currentStep === 1) {
    const practiceTypes = document.querySelectorAll('input[name="practice_type"]:checked');
    if (practiceTypes.length === 0) {
      alert('Please select at least one practice type');
      return;
    }
  }
  
  if (currentStep < totalSteps) {
    completedSteps.add(currentStep);
    currentStep++;
    showStep(currentStep);
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
  }
}

function updateBudgetDisplay() {
  const selected = document.querySelector('input[name="budget"]:checked');
  const display = document.getElementById('budget-display');
  if (selected && display) {
    const labels = {
      '2500-4000': '$2,500 – $4,000',
      '4000-7000': '$4,000 – $7,000',
      '7000-12000': '$7,000 – $12,000',
      '12000-plus': '$12,000+',
      'not-sure': 'Not sure — need guidance'
    };
    display.textContent = labels[selected.value] || '';
  } else if (display) {
    display.textContent = '';
  }
}

function initBudgetDisplay() {
  const budgetInputs = document.querySelectorAll('input[name="budget"]');
  budgetInputs.forEach(input => {
    input.addEventListener('change', updateBudgetDisplay);
  });
  updateBudgetDisplay();
}

function submitForm() {
  const form = document.getElementById('final-form');
  if (form && !form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  // Collect all form data
  const formData = {
    // Step 1
    practice_name: document.getElementById('practice_name')?.value || '',
    current_website: document.getElementById('current_website')?.value || '',
    city_state: document.getElementById('city_state')?.value || '',
    locations: document.querySelector('input[name="locations"]:checked')?.value || '',
    practice_type: Array.from(document.querySelectorAll('input[name="practice_type"]:checked')).map(cb => cb.value).join(', '),
    
    // Step 2
    website_goals: Array.from(document.querySelectorAll('input[name="website_goals"]:checked')).map(cb => cb.value).join(', '),
    
    // Step 3
    current_situation: document.querySelector('input[name="current_situation"]:checked')?.value || '',
    
    // Step 4
    pages: Array.from(document.querySelectorAll('input[name="pages"]:checked')).map(cb => cb.value).join(', '),
    page_count: document.querySelector('input[name="page_count"]:checked')?.value || '',
    
    // Step 5
    features: Array.from(document.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value).join(', '),
    
    // Step 6
    design_expectation: document.querySelector('input[name="design_expectation"]:checked')?.value || '',
    inspiration_websites: document.getElementById('inspiration_websites')?.value || '',
    brand_assets: Array.from(document.querySelectorAll('input[name="brand_assets"]:checked')).map(cb => cb.value).join(', '),
    
    // Step 7
    timeline: document.querySelector('input[name="timeline"]:checked')?.value || '',
    
    // Step 8
    budget: document.querySelector('input[name="budget"]:checked')?.value || '',
    
    // Step 9
    full_name: document.getElementById('full_name')?.value || '',
    role: document.getElementById('role')?.value || '',
    email: document.getElementById('email')?.value || '',
    phone: document.getElementById('phone')?.value || '',
    contact_method: document.querySelector('input[name="contact_method"]:checked')?.value || '',
    additional_notes: document.getElementById('additional_notes')?.value || ''
  };
  
  // Show loading state
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';
  
  // Submit to Formspark
  fetch('https://submit-form.com/ZoLPvZqoJ', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(formData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Form submission failed');
    }
    return response.json();
  })
  .then(data => {
    // Hide all steps
    document.querySelectorAll('.enx-step').forEach(s => {
      s.classList.remove('enx-step--active');
      s.style.display = 'none';
    });
    
    // Show success screen
    document.getElementById('success-screen').classList.add('enx-success--show');
    
    // Hide sidebar
    document.querySelector('.enx-sidebar').style.display = 'none';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  })
  .catch(error => {
    console.error('Error:', error);
    alert('There was an error submitting the form. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit request';
  });
}

// Theme Toggle
function initTheme() {
  const savedTheme = localStorage.getItem('enx-theme') || 'dark';
  document.body.setAttribute('data-theme', savedTheme);
  updateThemeToggle(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.body.setAttribute('data-theme', newTheme);
  localStorage.setItem('enx-theme', newTheme);
  updateThemeToggle(newTheme);
}

function updateThemeToggle(theme) {
  const labels = document.querySelectorAll('.enx-theme-toggle__label');
  if (labels.length >= 2) {
    labels[0].style.opacity = theme === 'dark' ? '1' : '0.5';
    labels[1].style.opacity = theme === 'light' ? '1' : '0.5';
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle event listeners
  const themeSwitch = document.getElementById('theme-switch');
  if (themeSwitch) {
    themeSwitch.addEventListener('click', toggleTheme);
    themeSwitch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }
  
  // Initialize theme
  initTheme();
  
  // Initialize step display
  updateSidebarProgress();
  updateMobileStepIndicator(1);
  
  // Make functions globally available
  window.nextStep = nextStep;
  window.prevStep = prevStep;
  window.submitForm = submitForm;
});

