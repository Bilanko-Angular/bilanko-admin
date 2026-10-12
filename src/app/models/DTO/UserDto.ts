// ==========================================
// AUTH DTOs
// ==========================================

export interface UserRegisterDto {
  name: string;
  subname: string;
  email: string;
  password: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
}

// ==========================================
// USER RESPONSE (GET /me)
// ==========================================

export type Role = 'ADMIN' | 'USER' | 'MANAGER';

export interface NotificationPreferencesDto {
  stockAlerts: boolean;
  newSales: boolean;
  monthlyReports: boolean;
  updates: boolean;
}

export interface AppearancePreferencesDto {
  theme: string;
  language: string;
  dateFormat: string;
  currency: string;
  compactMode: boolean;
}

export interface UserResponseDto {
  id: number;
  name: string;
  subname: string;
  email: string;
  role: Role;
  profilePictureUrl: string | null;
  phoneNumber: string | null;
  companyName: string | null;
  notificationPreferences: NotificationPreferencesDto | null;
  appearancePreferences: AppearancePreferencesDto | null;
}

// ==========================================
// REQUESTS (PUT payloads)
// ==========================================

export interface UpdateProfileRequest {
  name: string;
  subname?: string;
  phoneNumber?: string;
  companyName?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ==========================================
// ERROR RESPONSE
// ==========================================

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
}