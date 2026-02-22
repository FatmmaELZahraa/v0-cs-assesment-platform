import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORRECT: Enable CORS BEFORE starting the server
  app.enableCors({
    origin: 'https://v0-algo-trading-platform-beta-lilac.vercel.app/', // Front-end URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Start listening only after configuration is done
  await app.listen(process.env.PORT ?? 5000);

  console.log(`Backend server is running on http://localhost:5000`);
}
bootstrap();