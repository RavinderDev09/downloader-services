import { BadRequestException, Controller, flatten, Get, Query, Res } from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { Response } from 'express'; // ✅ Import Response from Express
import ytdl from 'ytdl-core';  
import * as fs from 'fs';
import * as path from 'path';





@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}


  @Get('search')
  async scrape(@Query('query') searchQuery: string) {
    if (!searchQuery) {
      return { message: "Please provide a search query" };
    }
    console.log('search', searchQuery);
    
    const result = await this.youtubeService.scrapeYouTube(searchQuery)
    return result
  }


  @Get('url')
  async getVideoDetails(@Query('url') url: string) {
    return this.youtubeService.getVideoDetails(url);
  }
  

 
  // @Get('download')
  // async download(@Query('url') url: string, @Query('format') format: 'mp4' | 'mp3', @Res() res: Response) {
  //   try {
  //     console.log('url', url, 'formate', format,);
      
  //     const filePath = await this.youtubeService.downloadVideo(url, format);
  //     console.log('filepagthe',filePath );
      
  //     return res.download(filePath);
  //   } catch (error) {
  //     console.log('errror', error );      
  //     res.status(500).json({ message: 'Download failed', error });
  //   }
  // }

  @Get('download')
  async download(@Query('url') url: string, @Query('format') format: string, @Res() res: Response) {
    try {
      const filePath = await this.youtubeService.downloadVideo(url, format);

      // ✅ Immediately respond with a download link
      return res.json({
        success: true,
        downloadUrl: `http://localhost:4000/youtube/files/${path.basename(filePath)}`,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error });
    }
  }

  @Get('files/:filename')
  async serveFile(@Query('filename') filename: string, @Res() res: Response) {
    const filePath = path.join("C:\\Users\\Asus\\Downloads", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "File not found!" });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/octet-stream");
    res.download(filePath);
  }
  
  

  
}
