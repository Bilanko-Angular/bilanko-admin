// src/app/service/api/user/user-api.service.ts

import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import {
  UserResponseDto,
  UpdateProfileRequest,
  ChangePasswordRequest,
  NotificationPreferencesDto,
  AppearancePreferencesDto,
} from '../../../models/DTO/UserDto';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private readonly basePath = environment.baseApiUrl + '/users';

  // GET /me — profil complet
  async getCurrentUser(): Promise<UserResponseDto> {
    const response = await apiClient.get<UserResponseDto>(`${this.basePath}/me`);
    console.log(response.data);
    return response.data;
  }

  // PUT /me — mise à jour du profil
  async updateProfile(request: UpdateProfileRequest): Promise<UserResponseDto> {
    const response = await apiClient.put<UserResponseDto>(`${this.basePath}/me`, request);
    return response.data;
  }

  // DELETE /me/delete-profile-picture - suprimer la photo de profile
  async deletePictureProfile():Promise<void> {
    await apiClient.delete(`${this.basePath}/me/delete-picture-profile`);
  }

  // PUT /me/password — changement de mot de passe
  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await apiClient.put(`${this.basePath}/me/password`, request);
  }

  // GET /me/notifications
  async getNotifications(): Promise<NotificationPreferencesDto> {
    const response = await apiClient.get<NotificationPreferencesDto>(`${this.basePath}/me/notifications`);
    return response.data;
  }

  // PUT /me/notifications
  async updateNotifications(prefs: NotificationPreferencesDto): Promise<NotificationPreferencesDto> {
    const response = await apiClient.put<NotificationPreferencesDto>(`${this.basePath}/me/notifications`, prefs);
    return response.data;
  }

  // POST /me/photo — upload photo de profil
  async uploadPhoto(file: File): Promise<UserResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<UserResponseDto>(`${this.basePath}/me/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // GET /me/appearance
  async getAppearance(): Promise<AppearancePreferencesDto> {
    const response = await apiClient.get<AppearancePreferencesDto>(`${this.basePath}/me/appearance`);
    return response.data;
  }

  // PUT /me/appearance
  async updateAppearance(prefs: AppearancePreferencesDto): Promise<AppearancePreferencesDto> {
    const response = await apiClient.put<AppearancePreferencesDto>(`${this.basePath}/me/appearance`, prefs);
    return response.data;
  }

  // POST /me/logout-all — déconnecter tous les appareils
  async logoutAllDevices(): Promise<void> {
    await apiClient.post(`${this.basePath}/me/logout-all`);
  }


}
