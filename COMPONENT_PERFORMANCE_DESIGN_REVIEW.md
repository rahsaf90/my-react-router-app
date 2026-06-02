# Component Performance and Design Review

Date: 2026-06-02

## Scope
- src/components/**
- src/app/pages/**

## Priority Recommendations

### High
1. Make KYC persistence idempotent on Maker resubmission/rework.
- Current behavior creates profile + child rows each submit.
- Suggested: upsert CoreProfile by task, then sync child collections.
- Files: src/app/pages/_dash/kyc-review/KycReviewWizard.tsx
- Status: Implemented (2026-06-03): CoreProfile now upserts (PATCH when existing),
  existing addresses/accounts/wealth rows are deleted and recreated from current payload.

### Medium
2. Avoid duplicate reference-data subscriptions in KYC flow.
- Countries/segments were being fetched in both wizard and maker form.
- Suggested: fetch once in wizard, pass via props.
- Files: src/app/pages/_dash/kyc-review/KycReviewWizard.tsx, src/app/pages/_dash/kyc-review/MakerStageForm.tsx

3. Reduce broad form re-renders in KYC maker form.
- Whole-form watch causes rerender churn.
- Suggested: use useWatch only for review sub-step.
- Files: src/app/pages/_dash/kyc-review/MakerStageForm.tsx

4. Replace unstable index keys in review lists.
- Suggested: use deterministic composite keys derived from row data.
- Files: src/app/pages/_dash/kyc-review/ReviewStep.tsx

5. Improve form wrapper consistency.
- Fix field prop typo and ensure select fields render validation helper text.
- Files: src/components/ui/FormFields.tsx

6. Remove avoidable derived state and render-time function composition in top bar.
- Suggested: compute route title with useMemo and render menu as a component.
- Files: src/components/nav/TopBar.tsx

7. Remove eager trigger/log patterns in dynamic section forms.
- Suggested: avoid trigger loop and nonessential logging.
- Files: src/app/pages/_dash/tasks/form/_components/sectionForm.tsx

## Implemented in this pass
- [x] KYC stage sort comparator made null-safe.
- [x] Countries/segments now sourced from wizard and passed into MakerStageForm.
- [x] MakerStageForm switched from broad watch() to useWatch() for review values.
- [x] ReviewStep list keys changed away from pure index keys.
- [x] FormFields typo fixed (`variant`) and select helper text added with FormHelperText.
- [x] TopBar route name derived with useMemo; ProfileMenu rendered as component props.
- [x] SectionForm trigger loop and extra debug logging removed.

## Implemented in follow-up pass (2026-06-03)
- [x] Added RTK mutations for `updateCoreProfile`, `deleteCustomerAddress`,
	`deleteCusAccount`, and `deleteSourceOfWealth`.
- [x] Updated KYC Maker submit orchestration to be idempotent:
	upsert profile, replace child collections, upload only selected new files,
	then advance workflow.

## Deferred Recommendations
- KYC persistence idempotency (upsert + child sync) requires coordinated API mutation additions and careful migration handling.
- Tasks page should move to controlled server-driven pagination/sorting/filtering.
- Idle timer should throttle refresh calls and replace moment with a lighter date utility.
