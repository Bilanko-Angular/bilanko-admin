import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, NotificationPreferences, AppearancePreferences } from '../../../models/person';
import { UserApiService } from '../../api/user/user-api.service';
import { UpdateProfileRequest, ChangePasswordRequest } from '../../../models/DTO/UserDto';
import { UserMapper } from '../../../mapper/UserMapper';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService {
  private readonly userApi = inject(UserApiService);
  private readonly router = inject(Router);

  readonly user = signal<User | null>(null);
  readonly notificationPreferences = signal<NotificationPreferences | null>(null);
  readonly appearancePreferences = signal<AppearancePreferences | null>(null);

  readonly isLoading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  constructor() {
    this.loadUser();
  }

  // Charge le profil complet (appelé au démarrage de l'app)
  async loadUser(): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    const token = localStorage.getItem('bilanko_jwt_token');
    if (!token) {
      this.router.navigate(['/connexion']);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const responseDto = await this.userApi.getCurrentUser();
      this.user.set(UserMapper.fromResponseDto(responseDto));
      this.notificationPreferences.set(UserMapper.notificationsFromDto(responseDto));
      this.appearancePreferences.set(UserMapper.appearanceFromDto(responseDto));
    } catch (error) {
      console.error('Failed to load user', error);
      this.error.set('Impossible de charger le profil');
      this.router.navigate(['/connexion']);
    } finally {
      this.isLoading.set(false);
    }
  }

  // Met à jour le profil (nom, téléphone, entreprise...) et resynchronise le signal
  async updateProfile(request: UpdateProfileRequest): Promise<void> {
    const responseDto = await this.userApi.updateProfile(request);
    this.user.set(UserMapper.fromResponseDto(responseDto));
  }

  // Upload une nouvelle photo de profil et resynchronise le signal
  async uploadPhoto(file: File): Promise<void> {
    const responseDto = await this.userApi.uploadPhoto(file);
    this.user.set(UserMapper.fromResponseDto(responseDto));
  }

  // Supprime la photo de profil et resynchronise le signal
  async deletePictureProfile(): Promise<void> {
    await this.userApi.deletePictureProfile();
    const current = this.user();
    if (current) {
      this.user.set({ ...current, profilePicture: undefined });
    }
  }

  // Récupère les préférences de notifications
  async loadNotifications(): Promise<void> {
    const dto = await this.userApi.getNotifications();
    this.notificationPreferences.set(dto);
  }

  // Met à jour les préférences de notifications
  async updateNotifications(prefs: NotificationPreferences): Promise<void> {
    const dto = await this.userApi.updateNotifications(prefs);
    this.notificationPreferences.set(dto);
  }

  // Récupère les préférences d'apparence (thème, langue, devise...)
  async loadAppearance(): Promise<void> {
    const dto = await this.userApi.getAppearance();
    this.appearancePreferences.set(dto);
  }

  // Met à jour les préférences d'apparence
  async updateAppearance(prefs: AppearancePreferences): Promise<void> {
    const dto = await this.userApi.updateAppearance(prefs);
    this.appearancePreferences.set(dto);
  }

  async changePassword(request: ChangePasswordRequest): Promise<void> {
    await this.userApi.changePassword(request);
  }

  async logoutAllDevices(): Promise<void> {
    await this.userApi.logoutAllDevices();
  }


  // Déconnexion propre : vide le store, retire le token, redirige
  clearUser(): void {
    this.user.set(null);
    this.notificationPreferences.set(null);
    this.appearancePreferences.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('bilanko_jwt_token');
    }
    this.router.navigate(['/connexion']);
  }
}