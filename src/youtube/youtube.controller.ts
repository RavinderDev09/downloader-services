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
    console.log('url', url);
    return this.youtubeService.getVideoDetails(url);
  }
  

 
  

  
}
