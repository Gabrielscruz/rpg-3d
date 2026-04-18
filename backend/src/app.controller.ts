import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return { status: 'ok', message: 'VTT Backend is running on Fastify!' };
  }
}
