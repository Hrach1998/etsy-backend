// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ Enable CORS for production
  app.enableCors({
    origin: [
      'https://etsy-backend-q2w1.onrender.com', // Netlify frontend
      'http://localhost:4200',                   // Local development
      'http://localhost:3000'                    // Local backend
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With'
  });

  // ✅ ADD THIS - Start the server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend server is running on port ${port}`);
}
bootstrap();