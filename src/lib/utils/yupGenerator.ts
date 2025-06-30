import * as Yup from 'yup';
import type { IFrmField, IFrmFieldRules, IFrmSect } from '../types/conf';

export function generateYupSchema(jsonConfig: IFrmSect) {
  const shape: Record<string, Yup.AnySchema> = {};
  const modelShapes: Record<string, Record<string, Yup.AnySchema>> = {};

  jsonConfig.sub_sections.forEach((subSection) => {
    subSection.fields.forEach((field) => {
      const model = field.model_name;
      if (!(model in modelShapes)) {
        modelShapes[model] = {};
      }
      modelShapes[model][field.attr_name] = getValidator(field);
    });
  });

  Object.keys(modelShapes).forEach((model) => {
    shape[model] = Yup.object().shape(modelShapes[model]);
  });

  return Yup.object().shape(shape);
}

const applyCommonStringRules = (
  validator: Yup.StringSchema,
  rules: IFrmFieldRules,
  fieldName: string,
) => {
  let v = validator.label(fieldName);
  v = rules.required ? v.required('Required') : v.optional();
  if (rules.min) v = v.min(rules.min, `Minimum length is ${rules.min}`);
  if (rules.max) v = v.max(rules.max, `Maximum length is ${rules.max}`);
  if (rules.pattern) {
    v = v.matches(
      new RegExp(rules.pattern),
      rules.error_message ?? 'Invalid format',
    );
  }
  return v;
};

const applyFieldValueRules = (
  validator: Yup.StringSchema,
  rules: IFrmFieldRules,
) => {
  let v = validator;
  if (rules.field_in_values) {
    rules.field_in_values.forEach((condition) => {
      v = v.when(`$${condition.field}`, {
        is: (val: string | number | (string | number)[]) => {
          let result = false;
          if (Array.isArray(val)) {
            result = condition.values.some(value => val.includes(value));
          }
          else {
            result = condition.values.includes(val);
          }
          return condition.isNot ? !result : result;
        }, // alternatively: (val) => val == true
        then: schema => schema.required(),
        otherwise: schema => schema.notRequired(),
      });
    });
  }

  if (rules.one_of_fields) {
    // v = v.oneOf(rules.one_of_fields.map(field => Yup.ref(`$${field}`)));
  }
  if (rules.when_eq_fields) {
    const { fields, isNot } = rules.when_eq_fields;
    v = v.when(fields.map(f => `$${f}`), {
      is: (val1: null | string | string[], val2: null | string | string[]) => {
        if (val1 === undefined || val2 === undefined) return false;
        if (val1 === null || val2 === null) return false;
        if (val1 === '' || val2 === '') return false;
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
      },
      then: schema => schema.required(),
      otherwise: schema => schema.notRequired(),
    });
  }

  if (rules.if_has_value) {
    const { fields, isNot } = rules.if_has_value;
    v = v.when(fields.map(f => `$${f}`), {
      is: (...values: string[]) => {
        const result = values.some(
          value => value !== undefined && value !== null && value !== '',
        );
        return isNot ? !result : result;
      },
      then: schema => schema.required(),
      otherwise: schema => schema.notRequired(),
    });
  }
  return v;
};

const getValidator = (field: IFrmField) => {
  const rules: IFrmFieldRules = field.rules ?? {};
  const fieldName = field.name;

  switch (field.field_type) {
    case 'text': {
      let validator = Yup.string();
      validator = applyCommonStringRules(validator, rules, fieldName);
      if (rules.format === 'email') validator = validator.email('Invalid email');
      validator = applyFieldValueRules(validator, rules);
      return validator;
    }
    case 'textarea': {
      let validator = Yup.string();
      validator = applyCommonStringRules(validator, rules, fieldName);
      return validator;
    }
    case 'number': {
      let validator = Yup.number().label(fieldName);
      if (rules.required) validator = validator.required('Required');
      if (rules.min !== undefined) validator = validator.min(rules.min);
      if (rules.max !== undefined) validator = validator.max(rules.max);
      return validator;
    }
    case 'date': {
      let validator = Yup.date().label(fieldName);
      if (rules.required) validator = validator.required('Required');
      if (rules.min) validator = validator.min(new Date(rules.min), 'Date is too early');
      if (rules.max) validator = validator.max(new Date(rules.max), 'Date is too late');
      return validator;
    }
    case 'select': {
      let validator = Yup.string().label(fieldName);
      if (rules.required) validator = validator.required('Required');
      return validator;
    }
    case 'multiselect': {
      let validator = Yup.array().of(Yup.string().label(fieldName));
      if (rules.required) validator = validator.required('Required');
      if (rules.min) {
        validator = validator.min(
          rules.min,
          `At least ${rules.min} options must be selected`,
        );
      }
      if (rules.max) {
        validator = validator.max(
          rules.max,
          `No more than ${rules.max} options can be selected`,
        );
      }
      return validator;
    }
    case 'checkbox': {
      let validator = Yup.boolean().label(fieldName);
      if (rules.required) validator = validator.required('Required');
      return validator;
    }
    default:
      return Yup.mixed().label(fieldName);
  }
};
// Usage:
// const schema = generateYupSchema(jsonConfig);
