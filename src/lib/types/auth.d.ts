import type { IAbstractModel } from './common';

export interface IUserLite {
  id: number; // Unique identifier for the user
  username: string; // Username of the user
  email: string; // Email address of the user
  full_name: string; // Full name of the user
  is_active: boolean; // Indicates if the user account is active
}

export interface IUserProfile extends IAbstractModel {
  emp_id: string; // Employee ID of the user
  full_name: string; // Full name of the user
  title: string; // Job title of the user
  department: string; // Department of the user
  human?: boolean; // Indicates if the user is a human (not a bot)
  country?: string; // Country of the user
  user_dp?: string; // URL to the user's profile picture
}

export interface IGroup {
  id: number; // Unique identifier for the group
  name: string; // Name of the group
}

export interface IUser extends IUserLite {
  first_name?: string; // Optional first name of the user
  last_name?: string; // Optional last name of the user

  groups?: IGroup[]; // Optional array of groups the user belongs to
  profile?: IUserProfile; // Optional user profile information
  is_superuser?: boolean; // Indicates if the user has superuser privileges
  is_staff?: boolean; // Indicates if the user is a staff member
  permissions?: string[]; // Optional array of permissions assigned to the user
  last_login?: Date | string; // Timestamp of the user's last login
  date_joined?: Date | string; // Timestamp of when the user joined
}
