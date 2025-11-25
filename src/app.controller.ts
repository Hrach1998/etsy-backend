import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return '🚀 Vortex Backend is running successfully!';
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return { 
      status: 'OK', 
      timestamp: new Date().toISOString() 
    };
  }
}