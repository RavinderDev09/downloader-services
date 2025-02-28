import { Module } from '@nestjs/common';
import { YoutubeModule } from './youtube/youtube.module';
import { MongooseModule } from '@nestjs/mongoose';
import { DownloadModule } from './download/download.module';

@Module({
  imports: [YoutubeModule,
    MongooseModule.forRoot("mongodb+srv://ravinder:ravi1234@cluster0.mcajp.mongodb.net"),
    DownloadModule
  ],
})
export class AppModule {}
