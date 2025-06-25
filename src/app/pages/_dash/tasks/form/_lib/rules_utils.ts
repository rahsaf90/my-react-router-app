import type { IFrmFieldRules } from '~/lib/types/conf';
import type { ISecFormValues } from './form';

export function isFieldVisible(
  rules: IFrmFieldRules | undefined,
  values: ISecFormValues,
): boolean {
  if (!rules) return true;
  if (rules.hidden_if_in) return checkHiddenIfIn(rules, values);
  return true;
}

export function checkHiddenIfIn(
  rules: IFrmFieldRules,
  values: ISecFormValues,
): boolean {
  if (!rules?.hidden_if_in) return false;

  return rules.hidden_if_in.every((condition) => {
    const val = values[condition.parent]?.[condition.field];
    if (Array.isArray(val)) {
      return condition.values.some(value => val.includes(value));
    }
    return condition.values.includes(val);
  });
}
