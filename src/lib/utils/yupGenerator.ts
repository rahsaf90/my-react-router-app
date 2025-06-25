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
  if (rules.required) v = v.required('Required');
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

const applyHiddenIfInRules = (
  validator: Yup.StringSchema,
  rules: IFrmFieldRules,
) => {
  let v = validator;
  if (rules.hidden_if_in) {
    rules.hidden_if_in.forEach((condition) => {
      v = v.when(`$${condition.parent}.${condition.field}`, {
        is: (val: string | number | (string | number)[]) => {
          if (Array.isArray(val)) {
            return condition.values.some(value => val.includes(value));
          }
          return condition.values.includes(val);
        }, // alternatively: (val) => val == true
        then: schema => schema.required(),
        otherwise: schema => schema.notRequired(),
      });
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
      if (rules.hidden_if_in) validator = applyHiddenIfInRules(validator, rules);
      //   if (rules.hidden_if_in) {
      //     validator = validator.test(
      //       'is-jimmy',
      //       '${path} is not Jimmy',

      //       (value, context) => {
      //         const otherVal = context.options.context.CoreProfile.planets;
      //         console.log(value, otherVal);
      //         return value === otherVal;
      //       },
      //     );
      //   }
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
