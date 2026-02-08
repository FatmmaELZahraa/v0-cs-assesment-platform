import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 5000);
  
  app.enableCors({
    origin: 'http://localhost:3000', // رابط الـ Frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

 console.log(`Backend server is running on http://localhost:5000`);
}
bootstrap();
