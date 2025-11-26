// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ Enable CORS
  app.enableCors({
    origin: [
      'https://zingy-blini-8a5ea5.netlify.app',
      'http://localhost:3000',
      'http://localhost:4200'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With, Accept, Origin'
  });

  // ✅ Global prefix for API routes - IMPORTANT
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend server is running on port ${port}`);
}
bootstrap();