import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  //TODO: poner url correcta
  app.enableCors({
    origin: ['http://localhost:4200', 'https://miapp.com'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
