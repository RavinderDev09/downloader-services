import { Module } from '@nestjs/common';
import { YoutubeModule } from './youtube/youtube.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DownloadModule } from './download/download.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [YoutubeModule,DownloadModule,
    ConfigModule.forRoot({isGlobal:true}), // Load .env file
    MongooseModule.forRoot('mongodb+srv://ravinder:ravi1234@cluster0.mcajp.mongodb.net')
    // MongooseModule.forRoot(process.env.MONGODB_URI), // Use MongoDB URI    DownloadModule
  ],
})
export class AppModule {}
