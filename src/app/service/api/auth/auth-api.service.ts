import { Injectable } from '@angular/core';
import { apiClient } from '../../../core/axios/axios.config';
import { User } from '../../../models/person';
import { UserMapper } from '../../../mapper/UserMapper';
import { AuthResponseDto } from '../../../models/DTO/UserDto';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly basePath = environment.baseApiUrl + '/auth';

  async login(userData: User): Promise<AuthResponseDto> {
    const userDto = UserMapper.toLoginDto(userData);
    const response = await apiClient.post<AuthResponseDto>(`${this.basePath}/login`, userDto);
    return response.data;
  }
}
