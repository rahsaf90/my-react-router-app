import { describe, expect, it } from 'vitest';
import type { IFrmSect } from '~/lib/types/conf';
import { generateYupSchema } from '~/lib/utils/yupGenerator';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeSection(fields: IFrmSect['sub_sections'][number]['fields']): IFrmSect {
  return {
    name: 'Test Section',
    version: 1,
    description: '',
    is_active: true,
    disp_order: 1,
    sub_sections: [
      {
        form_section: 1,
        name: 'Sub Section',
        version: 1,
        description: '',
        is_active: true,
        disp_order: 1,
        fields,
      },
    ],
  };
}

function makeField(
  overrides: Partial<IFrmSect['sub_sections'][number]['fields'][number]>,
): IFrmSect['sub_sections'][number]['fields'][number] {
  return {
    name: 'Test Field',
    version: 1,
    description: '',
    is_active: true,
    disp_order: 1,
    col_size: 12,
    field_type: 'text',
    model_name: 'testModel',
    attr_name: 'testAttr',
    form_sub_section: 1,
    ...overrides,
  };
}

// ─── generateYupSchema ───────────────────────────────────────────────────────

describe('generateYupSchema – text field', () => {
  it('generates a schema that passes for a valid string', async () => {
    const schema = generateYupSchema(
      makeSection([makeField({ rules: { required: true } })]),
    );
    await expect(
      schema.validate({ testModel: { testAttr: 'hello' } }),
    ).resolves.toBeDefined();
  });

  it('fails validation when a required text field is missing', async () => {
    const schema = generateYupSchema(
      makeSection([makeField({ rules: { required: true } })]),
    );
    await expect(
      schema.validate({ testModel: { testAttr: '' } }),
    ).rejects.toThrow('Required');
  });

  it('enforces min length', async () => {
    const schema = generateYupSchema(
      makeSection([makeField({ rules: { required: true, min: 5 } })]),
    );
    await expect(
      schema.validate({ testModel: { testAttr: 'ab' } }),
    ).rejects.toThrow('Minimum length is 5');
  });

  it('enforces max length', async () => {
    const schema = generateYupSchema(
      makeSection([makeField({ rules: { required: true, max: 3 } })]),
    );
    await expect(
      schema.validate({ testModel: { testAttr: 'toolong' } }),
    ).rejects.toThrow();
  });

  it('enforces email format', async () => {
    const schema = generateYupSchema(
      makeSection([
        makeField({ rules: { required: true, format: 'email' } }),
      ]),
    );
    await expect(
      schema.validate({ testModel: { testAttr: 'not-an-email' } }),
    ).rejects.toThrow('Invalid email');

    await expect(
      schema.validate({ testModel: { testAttr: 'user@example.com' } }),
    ).resolves.toBeDefined();
  });

  it('enforces a custom regex pattern', async () => {
    const schema = generateYupSchema(
      makeSection([
        makeField({
          rules: {
            required: true,
            pattern: '^[A-Z]{3}$',
            error_message: 'Must be 3 uppercase letters',
          },
        }),
      ]),
    );
    await expect(
      schema.validate({ testModel: { testAttr: 'abc' } }),
    ).rejects.toThrow('Must be 3 uppercase letters');

    await expect(
      schema.validate({ testModel: { testAttr: 'ABC' } }),
    ).resolves.toBeDefined();
  });
});

describe('generateYupSchema – number field', () => {
  it('passes for a valid number', async () => {
    const schema = generateYupSchema(
      makeSection([makeField({ field_type: 'number', rules: { required: true } })]),
    );
    await expect(
      schema.validate({ testModel: { testAttr: 42 } }),
    ).resolves.toBeDefined();
  });

  it('fails when a required number is missing', async () => {
    const schema = generateYupSchema(
      makeSection([makeField({ field_type: 'number', rules: { required: true } })]),
    );
    await expect(
      schema.validate({ testModel: { testAttr: undefined } }),
    ).rejects.toThrow('Required');
  });

  it('enforces min value', async () => {
    const schema = generateYupSchema(
      makeSection([
        makeField({ field_type: 'number', rules: { required: true, min: 10 } }),
      ]),
    );
    await expect(
      schema.validate({ testModel: { testAttr: 5 } }),
    ).rejects.toThrow();
  });
});

describe('generateYupSchema – select field', () => {
  it('passes for a non-empty select value', async () => {
    const schema = generateYupSchema(
      makeSection([makeField({ field_type: 'select', rules: { required: true } })]),
    );
    await expect(
      schema.validate({ testModel: { testAttr: 'option1' } }),
    ).resolves.toBeDefined();
  });

  it('fails when required select is empty', async () => {
    const schema = generateYupSchema(
      makeSection([makeField({ field_type: 'select', rules: { required: true } })]),
    );
    await expect(
      schema.validate({ testModel: { testAttr: '' } }),
    ).rejects.toThrow('Required');
  });
});

describe('generateYupSchema – multiple models', () => {
  it('creates separate nested objects per model_name', async () => {
    const section = makeSection([
      makeField({ model_name: 'modelA', attr_name: 'fieldA', rules: { required: true } }),
      makeField({ model_name: 'modelB', attr_name: 'fieldB', rules: { required: true } }),
    ]);
    const schema = generateYupSchema(section);
    await expect(
      schema.validate({ modelA: { fieldA: 'val' }, modelB: { fieldB: 'val' } }),
    ).resolves.toBeDefined();
  });
});
