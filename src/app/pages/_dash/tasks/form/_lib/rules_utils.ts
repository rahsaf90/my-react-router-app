import type { IFrmFieldRules } from '~/lib/types/conf';
import type { ISecFormValues } from './form';

export function isFieldVisible(
  rules: IFrmFieldRules | undefined,
  values: ISecFormValues,
): boolean {
  if (!rules) return true;
  if (rules.field_in_values) return checkHiddenIfIn(rules, values);
  if (rules.when_eq_fields) return checkHiddenWhenEq(rules, values);
  return true;
}

function checkHiddenIfIn(
  rules: IFrmFieldRules,
  values: ISecFormValues,
): boolean {
  if (!rules?.field_in_values) return false;

  return rules.field_in_values.filter(condition => condition.isHidden).every((condition) => {
    const [parent, field] = condition.field.split('.');
    const val = values[parent]?.[field];
    let result = false;
    if (Array.isArray(val)) {
      result = condition.values.some(value => val.includes(value));
    }
    else {
      result = condition.values.includes(val);
    }
    return condition.isNot ? !result : result;
  });
}

function checkHiddenWhenEq(
  rules: IFrmFieldRules,
  values: ISecFormValues,
): boolean {
  if (!rules?.when_eq_fields) return false;

  const { fields, isHidden, isNot } = rules.when_eq_fields;

  if (isHidden === false) return true; // If not hidden, always visible

  const [field1, field2] = fields.map(f => f.split('.'));
  const val1 = values[field1[0]]?.[field1[1]];
  const val2 = values[field2[0]]?.[field2[1]];

  let result = false;
  if (Array.isArray(val1) && Array.isArray(val2)) {
    result = val1.every((v, i) => v === val2[i]);
  }
  else if (Array.isArray(val1)) {
    result = val1.includes(val2 as string);
  }
  else if (Array.isArray(val2)) {
    result = val2.includes(val1);
  }
  else {
    result = val1 === val2;
  }

  return isNot ? !result : result;
}
