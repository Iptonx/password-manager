// src/modules/users/dto/login-response.dto.ts

export class LoginResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  encryptionSalt: string;

  constructor(
    accessToken: string,
    encryptionSalt: string,
    expiresIn: number = 3600,
  ) {
    this.accessToken = accessToken;
    this.tokenType = 'Bearer';
    this.expiresIn = expiresIn;
    this.encryptionSalt = encryptionSalt;
  }
}
