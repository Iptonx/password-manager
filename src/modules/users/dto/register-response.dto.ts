// src\modules\users\dto\register-response.dto.ts

export class RegisterResponseDto {
  message: string;
  email: string;

  constructor(email: string) {
    this.message = 'Usuario registrado conrrectamente (respuesta DTO)';
    this.email = email;
  }
}
