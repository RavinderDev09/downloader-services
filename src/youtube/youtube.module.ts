import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { YoutubeController } from './youtube.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './schema/youtube.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Video.name, schema:VideoSchema}])
  ],
  controllers: [YoutubeController],
  providers: [YoutubeService],
})
export class YoutubeModule {}
