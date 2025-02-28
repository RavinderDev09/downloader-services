import { Controller, Get, Query, Res } from '@nestjs/common';
import { DownloadService } from './download.service';
import { Response } from 'express';
import { format } from 'path';


@Controller('download')
export class DownloadController {
  constructor(private readonly downloadService: DownloadService) {}

  @Get('url')
  download(@Query('url') url: string,@Query("format")format:string, @Res() res: Response) {
    if (format==='mp4') {
      console.log('formate',format);
      return this.downloadService.downloadVideo(url, res);
    }else{
      return this.downloadService.downloadAudio(url,res)
    }
   
  }
}
