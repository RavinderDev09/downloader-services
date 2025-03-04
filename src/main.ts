import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { YoutubeModule } from './youtube/youtube.module';
import { YoutubeController } from './youtube/youtube.controller';
import { YoutubeService } from './youtube/youtube.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*', // Allow all origins (you can specify allowed domains)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });

  const PORT =  4000;
await app.listen(PORT, '0.0.0.0');
console.log(`✅ Server running on http://localhost:${PORT}`);


}
bootstrap();
