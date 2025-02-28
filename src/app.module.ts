import { Module } from '@nestjs/common';
import { YoutubeModule } from './youtube/youtube.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DownloadModule } from './download/download.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [YoutubeModule,DownloadModule,
    ConfigModule.forRoot({isGlobal:true}), // Load .env file
    MongooseModule.forRoot(process.env.MONGODB_URI), // Use MongoDB URI    DownloadModule
  ],
})
export class AppModule {}
