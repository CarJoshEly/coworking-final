import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const corsOrigins =
    process.env.CORS_ORIGIN?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? [];

  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : false,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
