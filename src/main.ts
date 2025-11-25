// main.ts - Railway compatible version
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ Enable CORS for production
  app.enableCors({
    origin: [
      'https://zingy-blini-8a5ea5.netlify.app', // Ձեր Netlify frontend
      'http://localhost:4200'                   // Local development
    ],
    credentials: true
  });
  
  // ✅ Railway-ը տալիս է PORT environment variable
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend server is running on port ${port}`);
}
bootstrap();