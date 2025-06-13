export interface IUserAuth {
  username: string;
  password: string;
  email?: string; // Optional for login, required for registration
  domain?: string; // Optional for login, required for registration
}

export interface IAuthResult {
  token?: string; // Optional token for authenticated requests
}
export interface IAuthSessionRefresh {
  detail: string;
  expiry_age: number;
  expiry_date: Date | string;
}
