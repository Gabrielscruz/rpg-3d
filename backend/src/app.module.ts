import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { YoutubeModule } from './youtube/youtube.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    YoutubeModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}