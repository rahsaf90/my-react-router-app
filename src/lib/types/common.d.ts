export interface IUserAuth {
  username: string
  password: string
  email?: string // Optional for login, required for registration
  domain?: string // Optional for login, required for registration
}

export interface IAuthResult {
  token?: string // Optional token for authenticated requests
}
export interface IAuthSessionRefresh {
  detail: string
  expiry_age: number
  expiry_date: Date | string
}

export interface IStatChip {
  text: string
  color: string
}
export interface IStatsBoxData {
  name: string
  value: number
  color: string
  icon: string
  loading: boolean
  chips?: IStatChip[] // Optional chips for additional stats
}

export interface IAPIListResponse<T> {
  count: number // Total number of items
  next: string | null // URL to the next page of results
  previous: string | null // URL to the previous page of results
  results: T[] // Array of items of type T
}

export interface IAbstractModel {
  id?: number // Unique identifier for the model
  url?: string // URL for the model instance
  created_time?: Date | string // Creation timestamp
  updated_time?: Date | string // Last update timestamp
  updated_by?: string // User who last updated the model
  created_by?: string // User who created the model
}

export interface IAbstractType {
  type_id: string
  url?: string // URL for the type instance
  name: string // Name of the type
  is_active: boolean // Indicates if the type is active
}

export type IStatsData = Record<string, number>;
