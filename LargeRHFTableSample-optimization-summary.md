# LargeRHFTableSample Performance Update

Date: 31 May 2026
File updated: src/components/forms/LargeRHFTableSample.tsx

## Why this change was made
The original question was whether converting this large form into a multistep wizard would improve performance. The conclusion was:
- A wizard can improve perceived performance and interaction flow.
- Real gains come from reducing validation churn and render cost, especially for large table sections.

## What was implemented

### 1) Multistep wizard flow
The component now uses a 3-step flow:
1. Request details
2. Line items
3. Review

It includes:
- Stepper UI
- Back and Next navigation
- Save action on the final step only

### 2) Step-gated validation
Validation now runs in a step-aware way:
- Next on step 1 validates detail fields only.
- Next on step 2 validates line items only.
- Save on final step runs full schema validation before submit.

This reduces unnecessary validation work while users are editing other parts of the form.

### 3) Virtualized line-item rendering
The line-items section now renders rows with a scroll-window strategy:
- Only visible rows (plus overscan buffer) are mounted.
- Top and bottom spacer rows preserve scroll height.
- This significantly reduces DOM and render work when item count is large.

### 4) Isolated totals calculation
Totals are computed in a dedicated memoized component that watches only line items.
This keeps recalculation and re-render scope smaller than recomputing across the parent form.

### 5) Validation mode tuning
Form behavior was adjusted to reduce validation frequency while typing:
- mode: onSubmit
- reValidateMode: onBlur

## Expected impact

### Performance
- Lower validation overhead during entry.
- Lower render cost for large line-item arrays.
- Better responsiveness as row count grows.

### UX
- Clearer progression through complex form sections.
- Reduced cognitive load from showing one section at a time.
- Safer final review before submit.

## Notes
- The implementation compiles cleanly in the updated file.
- If needed, a follow-up can add tests for step navigation, validation gates, and virtualized row behavior.
