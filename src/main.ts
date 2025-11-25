// main.ts - Railway compatible version
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ Enable CORS for production
  app.enableCors({
    origin: [
      'https://zingy-blini-8a5ea5.netlify.app', // Netlify frontend
      'http://localhost:4200',                   // Local development
      'http://localhost:3000',                   // Local backend
      '*'                                        // All origins (development)
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With'
  });
}
bootstrap();