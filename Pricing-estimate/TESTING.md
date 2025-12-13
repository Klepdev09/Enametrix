# Form Testing Guide

## 🧪 Manual Testing Checklist

### 1. Form Flow Testing

#### Single Service Flow
- [ ] Select "Single service" → Should show service selection
- [ ] Select a service → Should show service-specific questions
- [ ] Complete all steps → Should show estimate results
- [ ] Verify pricing calculation is correct
- [ ] Test all 7 single services

#### Complex Solution Flow
- [ ] Select "Complex solution" → Should show multi-select services
- [ ] Select only 1 service → Should auto-redirect to single flow
- [ ] Select 2+ services → Should continue complex flow
- [ ] Complete all steps → Should show estimate with bundle name
- [ ] Test with different service combinations

### 2. Navigation Testing
- [ ] Back button works on all steps
- [ ] Next button disabled when step invalid
- [ ] Cannot proceed without required fields
- [ ] Progress bar updates correctly
- [ ] Step indicator shows correct step number

### 3. Form Auto-Save Testing
- [ ] Fill out form partially
- [ ] Refresh page → Should restore form state
- [ ] Complete form → Should clear saved state on success
- [ ] Test with 24+ hour old saved state → Should not restore

### 4. Validation Testing

#### Email Validation
- [ ] Invalid email shows error message
- [ ] Valid email clears error
- [ ] Real-time validation as user types
- [ ] Cannot submit with invalid email

#### Required Fields
- [ ] Practice name required
- [ ] City/State required
- [ ] Email required
- [ ] Error messages appear for missing fields

### 5. Pricing Calculation Testing

#### Website Pricing
- [ ] Standard tier pricing correct
- [ ] Advanced tier pricing correct
- [ ] Package level based on page count:
  - [ ] ≤5 pages → Essential
  - [ ] 6-12 pages → Growth
  - [ ] 13-20 pages → Performance

#### Multipliers
- [ ] 2-3 locations → +15% applied
- [ ] 4+ locations → +25% applied
- [ ] ASAP timeline → +10% applied
- [ ] Standard/Flexible → No urgency multiplier

#### Discounts
- [ ] Multiple discounts selectable
- [ ] Only highest discount applied
- [ ] Discount calculation correct
- [ ] Monthly discount applies to retainer only

### 6. Results Screen Testing
- [ ] Price range displays correctly
- [ ] Monthly range shows if SEO selected
- [ ] Breakdown shows all selected services
- [ ] Website tier toggle works
- [ ] Recalculates when tier changes
- [ ] Discount selection updates price
- [ ] Disclaimer visible

### 7. Form Submission Testing
- [ ] Valid submission → Shows success screen
- [ ] Invalid email → Shows error
- [ ] Network error → Shows error with retry option
- [ ] Submission data includes all fields
- [ ] Time spent tracked correctly

### 8. Theme Testing
- [ ] Dark theme default
- [ ] Light theme toggle works
- [ ] Theme persists across page refresh
- [ ] All elements visible in both themes

### 9. Mobile Testing
- [ ] Form responsive on mobile
- [ ] Touch targets adequate size
- [ ] No horizontal scrolling
- [ ] Progress bar visible
- [ ] Buttons accessible

### 10. Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces step changes
- [ ] ARIA labels present
- [ ] Focus indicators visible
- [ ] Error messages announced
- [ ] Form inputs have labels

### 11. Edge Cases
- [ ] Empty form submission
- [ ] Very long practice names
- [ ] Special characters in inputs
- [ ] Multiple rapid clicks
- [ ] Browser back button
- [ ] Form abandonment and return

### 12. Performance Testing
- [ ] Form loads quickly
- [ ] No lag when typing
- [ ] Smooth transitions between steps
- [ ] No memory leaks on navigation

---

## 🐛 Known Issues to Test

1. **Website Tier Sync**: Verify websiteTier state syncs between ResultsScreen and formState
2. **Step Index Bounds**: Test rapid estimate type changes
3. **Discount Display**: Verify UI shows which discount is actually applied
4. **Form Reset**: Test if form can be reset without refresh

---

## 📊 Analytics to Verify

After submission, verify these are captured:
- Form completion time
- User agent
- Screen resolution
- Referrer URL
- All form selections
- Pricing calculations
- Selected discounts

---

## 🔍 Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 🚨 Error Scenarios

Test these error conditions:
1. Network failure during submission
2. Invalid Formspark endpoint
3. localStorage quota exceeded
4. Invalid JSON in saved state
5. Missing required fields
6. Invalid email format

---

## ✅ Success Criteria

Form is ready for production when:
- ✅ All validation works correctly
- ✅ Pricing calculations are accurate
- ✅ Form auto-saves and restores
- ✅ Error handling is user-friendly
- ✅ Mobile experience is smooth
- ✅ Accessibility standards met
- ✅ No console errors
- ✅ All edge cases handled

