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

const getValidator = (field: IFrmField) => {
  let validator;
  const rules: IFrmFieldRules = field.rules ?? {};
  switch (field.field_type) {
    case 'text':
      validator = Yup.string().label(field.name);
      if (rules.required) validator = validator.required('Required');
      if (rules.format === 'email') validator = validator.email('Invalid email');
      if (rules.min) validator = validator.min(rules.min, `Minimum length is ${rules.min}`);
      if (rules.max) validator = validator.max(rules.max, `Maximum length is ${rules.max}`);
      if (rules.pattern) {
        validator = validator.matches(
          new RegExp(rules.pattern),
          rules.error_message ?? 'Invalid format',
        );
      }
      break;
    case 'number':
      validator = Yup.number().label(field.name);
      if (rules.required) validator = validator.required('Required');
      if (rules.min !== undefined) validator = validator.min(rules.min);
      if (rules.max !== undefined) validator = validator.max(rules.max);
      break;
    case 'date':
      validator = Yup.date().label(field.name);
      if (rules.required) validator = validator.required('Required');
      if (rules.min) validator = validator.min(new Date(rules.min), 'Date is too early');
      if (rules.max) validator = validator.max(new Date(rules.max), 'Date is too late');
      break;
    case 'select':
      validator = Yup.string().label(field.name); ;
      if (rules.required) validator = validator.required('Required');
      break;

    case 'multiselect':
      validator = Yup.array().of(Yup.string().label(field.name));
      if (rules.required) validator = validator.required('Required');
      if (rules.min) {
        validator = validator.min(
          rules.min,
          'At least {min} options must be selected',
        );
      }
      if (rules.max) {
        validator = validator.max(
          rules.max,
          'No more than {max} options can be selected',
        );
      }
      break;

    case 'checkbox':
      validator = Yup.boolean().label(field.name);
      if (rules.required) validator = validator.required('Required');
      break;
    case 'textarea':
      validator = Yup.string();
      if (rules.required) validator = validator.required('Required');
      if (rules.min) validator = validator.min(rules.min, `Minimum length is ${rules.min}`);
      if (rules.max) validator = validator.max(rules.max, `Maximum length is ${rules.max}`);
      if (rules.pattern) {
        validator = validator.matches(
          new RegExp(rules.pattern),
          rules.error_message ?? 'Invalid format',
        );
      }
      break;
      // Add more types as needed
    default:
      validator = Yup.mixed().label(field.name);
  }
  return validator;
};
// Usage:
// const schema = generateYupSchema(jsonConfig);
