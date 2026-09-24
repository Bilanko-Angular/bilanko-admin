import { UserLoginDto, UserRegisterDto, UserResponseDto } from "../models/DTO/UserDto";
import { AppearancePreferences, NotificationPreferences, User } from "../models/person";

export class UserMapper {
  static toRegisterDto(user: User): UserRegisterDto {
    return {
      name: user.nom ?? '',
      subname: user.subname ?? '',
      email: user.email ?? '',
      password: user.password ?? '',
    };
  }

  static fromRegisterDto(dto: UserRegisterDto, id?: number): User {
    return {
      id: id,
      nom: dto.name,
      subname: dto.subname,
      email: dto.email,
    };
  }

  static toLoginDto(user: User): UserLoginDto {
    return {
      email: user.email ?? '',
      password: user.password ?? '',
    };
  }
  static fromResponseDto(dto: UserResponseDto): User {
    return {
      id: dto.id,
      nom: dto.name,
      subname: dto.subname,
      email: dto.email,
      role: dto.role,
      profilePicture: dto.profilePictureUrl ?? undefined,
      phoneNumber: dto.phoneNumber ?? undefined,
      companyName: dto.companyName ?? undefined,
    };
  }

  static notificationsFromDto(dto: UserResponseDto): NotificationPreferences | null {
    return dto.notificationPreferences ?? null;
  }

  static appearanceFromDto(dto: UserResponseDto): AppearancePreferences | null {
    return dto.appearancePreferences ?? null;
  }

}