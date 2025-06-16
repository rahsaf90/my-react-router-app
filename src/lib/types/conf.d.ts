import type { IAbstractModel } from './common';

export interface ICountry extends IAbstractModel {
  name: string
  code: string
}

export interface ISegment extends IAbstractModel {
  country: number
  name: string
  description: string
}

export interface IListOption extends IAbstractModel {
  name: string
  list_type: number
  description: string
  value: string
  num1_val?: number | null
  num2_val?: number | null
  bool_val?: boolean | null
  dt1_val?: Date | string | null
  dt2_val?: Date | string | null
  is_active: boolean
}

export interface IListType extends IAbstractModel {
  name: string
  version: number
  description: string
  is_active: boolean
  options: IListOption[]
}

export interface IFrmField extends IAbstractModel {
  name: string
  version: number
  description: string
  is_active: boolean
  disp_order: number
  field_type: 'text|number|date|select |multiselect|checkbox|textarea'
  model_name: string
  attr_name: string
  mandatory: boolean
  list_type?: number // Optional, if field type is select or multiselect
  form_sub_section: number // Optional, if field belongs to a form subsection
}

export interface IFrmSubSect extends IAbstractModel {
  form_section: number
  name: string
  version: number
  description: string
  is_active: boolean
  disp_order: number
  fields: IFrmField[]
}

export interface IFrmSect extends IAbstractModel {
  name: string
  version: number
  description: string
  is_active: boolean
  disp_order: number
}

export interface IFrmTmplSerialized extends IAbstractModel {
  version: number
  name: string
  description: string
  is_active: boolean

  form_type: ITaskType
  segments: ISegment[]
  list_types: IListType[]
  form_sections: IFrmSect[]

}

export interface IFrmTmpl extends IAbstractModel {
  form_type: number
  form_type_name?: string
  version: number
  name: string
  description: string
  is_active: boolean
  json_config: IFrmTmplSerialized
}
