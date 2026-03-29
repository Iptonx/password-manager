import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /**
   * Prefijo global para APIs
   * Ej: http://localhost:8000/api/users
   */
  app.setGlobalPrefix('api');

  /**
   * CORS habilitado
   * Permite frontend React/Next conectarse
   */
  app.enableCors({
    origin: true, // en produccion se colocar la url del frontend
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
  });

  /**
   * Validación global para DTOs
   * - whitelist: elimina campos extra
   * - forbidNonWhitelisted: error si mandan campos no permitidos
   * - transform: convierte tipos automáticamente
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  /**
   * Swagger Docs (API Documentation)
   */
  const config = new DocumentBuilder()
    .setTitle('Password Manager API')
    .setDescription('API documentation for the Password Manager backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const configService = app.get(ConfigService);

  const port = configService.get<number>('PORT') ?? 5000;

  await app.listen(port);

  console.log(`🚀 API ejecutandose en: http://localhost:${port}/api`);
  console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}

void bootstrap();
