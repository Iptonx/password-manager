# Password Manager API - Guía para Frontend Next.js

## Descripción del Proyecto

Este es el backend de un **Gestor de Contraseñas** (Password Manager) construido con **NestJS**. El frontend debe ser una aplicación Next.js que consuma esta API para permitir a los usuarios:

- Registrarse e iniciar sesión
- Gestionar categorías para organizar sus cuentas
- Crear, editar, eliminar y buscar cuentas/credenciales encriptadas
- Marcar cuentas como favoritas
- Mover cuentas entre categorías
- Recuperar cuentas eliminadas (papelera)

---

## Arquitectura de Seguridad

### Cifrado del Lado del Cliente (CRÍTICO)

**Importante:** Este backend espera que TODOS los datos sensibles sean cifrados **antes** de enviarse desde el frontend. El servidor NUNCA recibe contraseñas en texto plano.

**Flujo de cifrado:**

1. El usuario ingresa su contraseña maestra en el frontend
2. El frontend deriva una clave de cifrado usando PBKDF2/Argon2
3. Todos los campos sensibles se cifran con **AES-256-GCM** antes de enviar
4. El backend solo almacena datos cifrados

**Campos que deben cifrarse:**
- `serviceNameEncrypted` - Nombre del servicio (ej: "Google", "Facebook")
- `usernameEncrypted` - Usuario/email de la cuenta
- `passwordEncrypted` - Contraseña del servicio
- `notesEncrypted` - Notas adicionales (opcional)
- `urlEncrypted` - URL del sitio (opcional)

**Parámetros de cifrado a enviar:**
- `encryptionIv` - Vector de inicialización (12 bytes para AES-GCM)
- `encryptionAlgorithm` - Siempre `"AES-256-GCM"`
- `serviceNameHash` - SHA256 del nombre del servicio (para búsqueda sin descifrar)

---

## Configuración del Proyecto Next.js

### Variables de Entorno (.env.local)

```bash
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Cifrado (para derivar clave maestra)
NEXT_ENCRYPTION_KEY_LENGTH=32
NEXT_PBKDF2_ITERATIONS=100000
NEXT_AES_GCM_IV_LENGTH=12
```

### Cliente HTTP Recomendado

```typescript
// lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Endpoints de la API

### Base URL
```
http://localhost:4000/api
```

### Documentación Swagger
```
http://localhost:4000/docs
```

---

## Módulo de Autenticación (`/auth`)

**No requiere autenticación**

### POST `/auth/register`

Registrar nuevo usuario.

**Body:**
```typescript
interface RegisterBody {
  email: string;           // Email válido
  passwordHash: string;    // Hash bcrypt de la contraseña (60-128 chars)
  encryptionSalt: string;  // Salt para cifrado (mínimo 16 chars)
}
```

**Response (201):**
```typescript
{
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  message: string;
}
```

---

### POST `/auth/login`

Iniciar sesión y obtener JWT.

**Body:**
```typescript
interface LoginBody {
  email: string;
  password: string;  // Contraseña en texto plano (el backend hace hash)
}
```

**Response (200):**
```typescript
{
  user: {
    id: string;
    email: string;
    lastLoginAt: string;
  };
  token: string;      // JWT token
  expiresIn: number;  // Segundos (ej: 900 = 15 min)
}
```

**Manejo de errores:**
- `401`: Credenciales inválidas
- `423`: Cuenta bloqueada (demasiados intentos fallidos) o inactiva

---

### POST `/auth/reactivate`

Reactivar cuenta desactivada.

**Body:**
```typescript
interface ReactivateBody {
  email: string;
  password: string;
}
```

---

## Módulo de Usuarios (`/users`)

**Requiere autenticación JWT**

### GET `/users/me`

Obtener perfil del usuario actual.

**Response (200):**
```typescript
{
  user: {
    id: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    lastLoginAt: string;
    isActive: boolean;
  };
}
```

---

### PUT `/users/me`

Actualizar perfil del usuario.

**Body:**
```typescript
interface UpdateUserBody {
  email?: string;
  isActive?: boolean;
}
```

---

### POST `/users/me/change-password`

Cambiar contraseña.

**Body:**
```typescript
interface ChangePasswordBody {
  currentPassword: string;  // Contraseña actual (texto plano)
  newPasswordHash: string;  // Hash bcrypt de la nueva contraseña
}
```

---

### PATCH `/users/me/deactivate`

Desactivar cuenta propia (soft delete).

**Response:** Usuario desactivado

---

### PATCH `/users/me/reactivate`

Reactivar cuenta propia previamente desactivada.

---

### DELETE `/users/me`

Eliminar cuenta propia (hard delete - irreversible).

**Advertencia:** Elimina todas las categorías y cuentas asociadas.

---

## Módulo de Categorías (`/categories`)

**Requiere autenticación JWT**

### POST `/categories`

Crear nueva categoría.

**Body:**
```typescript
interface CreateCategoryBody {
  name: string;         // Requerido, máximo 100 chars, único por usuario
  color?: string;       // Opcional, formato HEX (#FF5733)
  icon?: string;        // Opcional, nombre del ícono (máx 50 chars)
  displayOrder?: number; // Opcional, 0-9999, para ordenamiento
}
```

**Response (201):**
```typescript
{
  category: {
    id: string;
    userId: string;
    name: string;
    color: string | null;
    icon: string | null;
    displayOrder: number;
    createdAt: string;
    updatedAt: string;
  };
}
```

---

### GET `/categories`

Listar todas las categorías del usuario, ordenadas por `displayOrder`.

**Response (200):**
```typescript
{
  categories: Array<{
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    displayOrder: number;
    accountCount?: number;  // Cantidad de cuentas en esta categoría
  }>;
}
```

---

### GET `/categories/:id`

Obtener categoría específica con cantidad de cuentas.

**Response (200):**
```typescript
{
  category: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
    displayOrder: number;
    accountCount: number;
  };
}
```

---

### PUT `/categories/:id`

Actualizar categoría.

**Body:** Mismo formato que `CreateCategoryBody` (todos opcionales)

---

### POST `/categories/reorder`

Reordenar categorías (para drag-and-drop).

**Body:**
```typescript
interface ReorderCategoriesBody {
  categories: Array<{
    id: string;
    displayOrder: number;
  }>;
}
```

---

### DELETE `/categories/:id`

Eliminar categoría.

**Query Params:**
- `moveTo`: UUID de categoría destino o `'null'` para mover cuentas a "sin categoría"

**Comportamiento:**
- Las cuentas de la categoría eliminada se mueven a la categoría especificada
- Si `moveTo=null`, las cuentas quedan sin categoría (categoryId = NULL)

---

## Módulo de Cuentas (`/accounts`)

**Requiere autenticación JWT**

### POST `/accounts`

Crear nueva cuenta/credencial.

**Body:**
```typescript
interface CreateAccountBody {
  categoryId?: string | null;  // UUID de la categoría (opcional)
  
  // Datos cifrados (el frontend debe cifrar antes de enviar)
  serviceNameEncrypted: string;
  usernameEncrypted: string;
  passwordEncrypted: string;
  notesEncrypted?: string | null;
  urlEncrypted?: string | null;
  
  // Parámetros de cifrado
  encryptionIv: string;  // IV de 12 bytes en base64/hex
  encryptionAlgorithm?: 'AES-256-GCM';  // Default
  
  // Metadata para búsqueda (hash del nombre, no cifrado)
  serviceNameHash: string;  // SHA256(serviceName)
  
  // Opcionales
  isFavorite?: boolean;
}
```

**Response (201):**
```typescript
{
  account: {
    id: string;
    userId: string;
    categoryId: string | null;
    serviceNameEncrypted: string;
    usernameEncrypted: string;
    passwordEncrypted: string;
    notesEncrypted: string | null;
    urlEncrypted: string | null;
    encryptionIv: string;
    encryptionAlgorithm: string;
    serviceNameHash: string;
    isFavorite: boolean;
    isDeleted: boolean;
    lastUsedAt: string | null;
    createdAt: string;
    updatedAt: string;
    passwordChangedAt: string;
  };
}
```

---

### GET `/accounts`

Listar cuentas con paginación y filtros.

**Query Params:**
```typescript
interface ListAccountsParams {
  categoryId?: string;      // Filtrar por categoría
  isFavorite?: boolean;     // Filtrar favoritos
  isDeleted?: boolean;      // Filtrar eliminadas (default: false)
  page?: number;            // Página (default: 1)
  limit?: number;           // Por página (default: 20, max: 100)
  orderBy?: string;         // Campo para ordenar (createdAt, serviceName, etc.)
  orderDirection?: 'ASC' | 'DESC';
}
```

**Response (200):**
```typescript
{
  accounts: Array<{
    id: string;
    categoryId: string | null;
    serviceNameEncrypted: string;
    usernameEncrypted: string;
    passwordEncrypted: string;
    notesEncrypted: string | null;
    urlEncrypted: string | null;
    encryptionIv: string;
    serviceNameHash: string;
    isFavorite: boolean;
    isDeleted: boolean;
    lastUsedAt: string | null;
    createdAt: string;
    updatedAt: string;
    categoryName?: string;  // Si se incluye relación
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
```

---

### GET `/accounts/deleted`

Obtener cuentas eliminadas (papelera).

**Response:** Lista de cuentas con `isDeleted: true`

---

### GET `/accounts/by-category/:categoryId`

Obtener todas las cuentas de una categoría específica.

---

### GET `/accounts/:id`

Obtener cuenta específica por ID.

**Response:**
```typescript
{
  account: {
    // ... todos los campos de la cuenta
    category?: {
      id: string;
      name: string;
      color: string | null;
      icon: string | null;
    };
  };
}
```

---

### PUT `/accounts/:id`

Actualizar cuenta.

**Body:** Mismo formato que `CreateAccountBody` (todos los campos opcionales)

**Nota:** Solo actualizar los campos que el usuario modificó. El frontend debe:
1. Descifrar los datos actuales
2. Modificar solo los campos necesarios
3. Volver a cifrar todo
4. Enviar solo los campos modificados

---

### PATCH `/accounts/:id/favorite`

Marcar/desmarcar como favorito.

**Body:**
```typescript
{
  isFavorite: boolean;
}
```

---

### PATCH `/accounts/:id/use`

Actualizar `lastUsedAt` (cuando el usuario accede a una cuenta).

**Response:** Cuenta con `lastUsedAt` actualizado

---

### DELETE `/accounts/:id`

Eliminación suave (soft delete) - la cuenta va a la papelera.

**Comportamiento:**
- `isDeleted` se establece en `true`
- `deletedAt` se establece en la fecha actual
- La cuenta no aparece en listados normales

---

### POST `/accounts/:id/restore`

Restaurar cuenta eliminada (saca de la papelera).

**Comportamiento:**
- `isDeleted` se establece en `false`
- `deletedAt` se establece en `null`

---

### DELETE `/accounts/:id/permanent`

Eliminación permanente (irreversible).

**Advertencia:** No se puede recuperar la cuenta.

---

### POST `/accounts/batch/delete`

Eliminación suave múltiple.

**Body:**
```typescript
{
  ids: string[];  // Array de UUIDs de cuentas a eliminar
}
```

---

### GET `/accounts/search/by-hash/:hash`

Buscar cuentas por hash del nombre del servicio.

**Útil para:** Verificar si ya existe una cuenta para un servicio sin necesidad de descifrar.

---

## Modelos de Datos

### User
```typescript
interface User {
  id: string;              // UUID
  email: string;
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
  lastLoginAt: string | null;
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: string | null;
}
```

### Category
```typescript
interface Category {
  id: string;              // UUID
  userId: string;          // FK a User
  name: string;            // Único por usuario
  color: string | null;    // HEX color
  icon: string | null;     // Icon name
  displayOrder: number;    // Para ordenamiento
  createdAt: string;
  updatedAt: string;
}
```

### Account
```typescript
interface Account {
  id: string;                    // UUID
  userId: string;                // FK a User
  categoryId: string | null;     // FK a Category (SET NULL on delete)
  
  // Datos cifrados
  serviceNameEncrypted: string;
  usernameEncrypted: string;
  passwordEncrypted: string;
  notesEncrypted: string | null;
  urlEncrypted: string | null;
  
  // Cifrado
  encryptionIv: string;
  encryptionAlgorithm: string;   // 'AES-256-GCM'
  
  // Búsqueda
  serviceNameHash: string;       // SHA256 del nombre
  
  // Estado
  isFavorite: boolean;
  isDeleted: boolean;
  lastUsedAt: string | null;
  passwordChangedAt: string;
  
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

---

## Flujo de Trabajo Recomendado

### 1. Registro de Usuario

```typescript
// 1. Usuario ingresa email y contraseña maestra
// 2. Generar salt aleatorio
const encryptionSalt = crypto.randomBytes(32).toString('hex');

// 3. Derivar clave de cifrado desde la contraseña
const key = await deriveKey(password, encryptionSalt);

// 4. Hashear contraseña para bcrypt
const passwordHash = await bcrypt.hash(password, 10);

// 5. Enviar al backend
await apiClient.post('/auth/register', {
  email,
  passwordHash,
  encryptionSalt,
});
```

### 2. Login

```typescript
// 1. Usuario ingresa credenciales
// 2. Login al backend
const { data } = await apiClient.post('/auth/login', {
  email,
  password,
});

// 3. Guardar token y salt
localStorage.setItem('jwt_token', data.token);
localStorage.setItem('encryption_salt', data.user.encryptionSalt);

// 4. Derivar clave de cifrado para usar en sesión
const key = await deriveKey(password, data.user.encryptionSalt);
```

### 3. Crear Cuenta

```typescript
// 1. Usuario ingresa datos de la cuenta
const serviceData = {
  serviceName: 'Google',
  username: 'user@gmail.com',
  password: 'secretpassword123',
  notes: 'Cuenta personal',
  url: 'https://google.com',
};

// 2. Cifrar datos
const iv = crypto.randomBytes(12); // 12 bytes para AES-GCM
const encrypted = await encryptData(serviceData, encryptionKey, iv);

// 3. Calcular hash para búsqueda
const serviceNameHash = crypto
  .createHash('sha256')
  .update(serviceData.serviceName)
  .digest('hex');

// 4. Enviar al backend
await apiClient.post('/accounts', {
  categoryId: selectedCategoryId,
  serviceNameEncrypted: encrypted.serviceName,
  usernameEncrypted: encrypted.username,
  passwordEncrypted: encrypted.password,
  notesEncrypted: encrypted.notes,
  urlEncrypted: encrypted.url,
  encryptionIv: iv.toString('hex'),
  encryptionAlgorithm: 'AES-256-GCM',
  serviceNameHash,
  isFavorite: false,
});
```

### 4. Leer/Descifrar Cuentas

```typescript
// 1. Obtener cuentas del backend
const { data } = await apiClient.get('/accounts');

// 2. Descifrar cada cuenta
const decryptedAccounts = data.accounts.map((account: Account) => ({
  ...account,
  serviceName: decryptData(account.serviceNameEncrypted, key, account.encryptionIv),
  username: decryptData(account.usernameEncrypted, key, account.encryptionIv),
  password: decryptData(account.passwordEncrypted, key, account.encryptionIv),
  notes: decryptData(account.notesEncrypted, key, account.encryptionIv),
  url: decryptData(account.urlEncrypted, key, account.encryptionIv),
}));
```

---

## Manejo de Errores

### Códigos de Error Comunes

| Código | Significado | Acción Recomendada |
|--------|-------------|-------------------|
| 400 | Bad Request | Validar datos antes de enviar |
| 401 | No autorizado | Redirigir a login, limpiar token |
| 403 | Prohibido | Verificar permisos |
| 404 | No encontrado | Mostrar mensaje apropiado |
| 409 | Conflicto | Ej: email ya existe, categoría duplicada |
| 422 | Error de validación | Mostrar errores de campos específicos |
| 423 | Cuenta bloqueada | Mostrar tiempo restante de bloqueo |
| 500 | Error interno | Reintentar o mostrar error genérico |

### Respuesta de Error Típica

```typescript
{
  statusCode: number;
  message: string | string[];  // Array si son errores de validación
  error: string;
}
```

---

## Consideraciones de Seguridad para el Frontend

### 1. Almacenamiento de Tokens

```typescript
// Opción recomendada: HttpOnly cookies (más seguro)
// El backend debe configurarse para enviar token como cookie

// Opción alternativa: localStorage (más conveniente pero menos seguro)
localStorage.setItem('jwt_token', token);
```

### 2. Manejo de la Clave Maestra

```typescript
// NUNCA almacenar la contraseña maestra en localStorage/sessionStorage
// Derivar la clave y mantenerla solo en memoria (variable React context)

const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);

// Al hacer logout, limpiar la clave
setEncryptionKey(null);
```

### 3. Timeout de Sesión

```typescript
// Implementar auto-logout después de X minutos de inactividad
// El token JWT expira en 15 minutos por defecto
// Considerar refresh token para sesiones largas
```

### 4. Limpieza de Datos Sensibles

```typescript
// Limpiar variables con datos sensibles después de usar
useEffect(() => {
  return () => {
    // Limpiar al desmontar componente
    sensitiveData = null;
  };
}, []);
```

---

## Estructura de Carpetas Sugerida para Next.js

```
src/
├── app/                      # App Router (Next.js 13+)
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── accounts/
│   │   ├── categories/
│   │   └── settings/
│   └── layout.tsx
├── components/
│   ├── accounts/
│   ├── categories/
│   ├── auth/
│   └── ui/
├── lib/
│   ├── api-client.ts         # Axios instance
│   ├── crypto.ts             # Funciones de cifrado/descifrado
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useAccounts.ts
│   └── useCategories.ts
├── contexts/
│   └── AuthContext.tsx
├── types/
│   └── index.ts
└── middleware.ts             # Proteger rutas
```

---

## Ejemplo de Implementación de Hook

```typescript
// hooks/useAccounts.ts
import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { decryptData, encryptData } from '@/lib/crypto';

interface Account {
  id: string;
  serviceNameEncrypted: string;
  // ... otros campos
}

export function useAccounts(encryptionKey: CryptoKey | null) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        const { data } = await apiClient.get('/accounts');
        setAccounts(data.accounts);
      } finally {
        setLoading(false);
      }
    }
    
    if (encryptionKey) {
      fetchAccounts();
    }
  }, [encryptionKey]);

  const createAccount = async (accountData: CreateAccountInput) => {
    const iv = crypto.randomBytes(12);
    const encrypted = await encryptData(accountData, encryptionKey!, iv);
    
    const { data } = await apiClient.post('/accounts', {
      ...encrypted,
      encryptionIv: iv.toString('hex'),
      serviceNameHash: crypto
        .createHash('sha256')
        .update(accountData.serviceName)
        .digest('hex'),
    });
    
    setAccounts([...accounts, data.account]);
    return data.account;
  };

  const deleteAccount = async (id: string) => {
    await apiClient.delete(`/accounts/${id}`);
    setAccounts(accounts.filter(a => a.id !== id));
  };

  return { accounts, loading, createAccount, deleteAccount };
}
```

---

## Recursos Adicionales

- **Swagger UI:** http://localhost:4000/docs
- **Puerto del servidor:** 4000
- **Prefijo de API:** /api
- **Token JWT:** 15 minutos de expiración (configurable en .env)

---

## Notas Importantes

1. **CORS:** El backend tiene CORS habilitado para todos los orígenes. En producción, restringir al dominio del frontend.

2. **Sincronización:** El backend usa `synchronize: true` en TypeORM. En producción, usar migraciones.

3. **Soft Delete:** Las cuentas eliminadas pueden restaurarse desde la papelera hasta que se eliminen permanentemente.

4. **Cascadas:**
   - Eliminar usuario → elimina todas sus categorías y cuentas
   - Eliminar categoría → las cuentas pasan a `categoryId = NULL` o a otra categoría

5. **Búsqueda:** Usar `serviceNameHash` para buscar sin descifrar los datos.
