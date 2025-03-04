import { BadRequestException, Injectable, StreamableFile } from '@nestjs/common';
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';
import { InjectModel } from '@nestjs/mongoose';
import {  Video } from './schema/youtube.schema';
import { Model } from 'mongoose';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import YTDlpWrap from 'yt-dlp-wrap';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = promisify(exec);


@Injectable()
export class YoutubeService {
  private ytDlp = new YTDlpWrap();

  //
  private ytDlpPath = "C:\\Users\\Asus\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\yt-dlp.exe"; // Ensure this is correct


  private downloadDirectory = path.join(__dirname, '../../downloads');


    constructor(@InjectModel(Video.name) private videoModel: Model<Video>) {
      if (!fs.existsSync(this.downloadDirectory)) {
        fs.mkdirSync(this.downloadDirectory, { recursive: true });
      }
    }

async scrapeYouTube(searchQuery: string) {
  const searchURL = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
  const response = await axios.get(searchURL);
  const $ = cheerio.load(response.data);

  let ytInitialDataScript = '';

  // ✅ Extract ytInitialData script content
  $('script').each((i, script) => {
      const scriptContent = $(script).html();
      if (scriptContent.includes('var ytInitialData')) {
          ytInitialDataScript = scriptContent;
      }
  });

  // ✅ Check if extraction worked
  if (!ytInitialDataScript) {
      console.error("❌ Error: Could not find ytInitialData script!");
      return { message: "YouTube page structure changed. Update scraper logic." };
  }

  console.log("✅ Extracted ytInitialData Script (First 500 characters):", ytInitialDataScript.slice(0, 500));

  try {
      // ✅ Improved JSON extraction (Remove unwanted characters)
      const jsonStr = ytInitialDataScript.match(/var ytInitialData = (\{.*\});/s);
      if (!jsonStr || jsonStr.length < 2) {
          throw new Error("ytInitialData JSON extraction failed");
      }

      const jsonData = JSON.parse(jsonStr[1]); // Extract the actual JSON part

      console.log("✅ Parsed ytInitialData Successfully!");

      // ✅ Extract video data
      const videos = [];
      const items = jsonData.contents.twoColumnSearchResultsRenderer.primaryContents
          .sectionListRenderer.contents[0].itemSectionRenderer.contents;

      items.forEach((item: any) => {
          if (item.videoRenderer) {
              const videoId = item.videoRenderer.videoId;
              videos.push({
                  title: item.videoRenderer.title.runs[0].text,
                  url: `https://www.youtube.com/watch?v=${videoId}`,
                  length: item.videoRenderer.lengthText?.simpleText || "Unknown",

                  // ✅ Fix Thumbnail Extraction
                  thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
              });
          }
      });

      return { video: videos };

  } catch (error) {
      console.error("❌ JSON Parsing Error:", error);
      return { message: "Error parsing YouTube data. Try again later." };
  }
}


async  getVideoDetails(videoUrl: string) {
  try {
    console.log('Fetching video details for:', videoUrl);

    // Validate if it's a YouTube URL
    if (!/^https?:\/\/(www\.)?youtube\.com\/watch\?v=/.test(videoUrl)) {
      throw new Error('Invalid YouTube video URL');
    }

    // Fetch the page content with a User-Agent header
    const { data } = await axios.get(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);

    // Extract video details
    const title = $('meta[name="title"]').attr('content') || $('title').text().trim() || 'No title';
    const thumbnail = $('meta[property="og:image"]').attr('content') || '';
    const duration = $('meta[itemprop="duration"]').attr('content') || '';

    // Extract related videos
    const relatedVideos: { title: string; url: string; thumbnail: string }[] = [];
    $('a#thumbnail').each((_, el) => {
      const videoTitle = $(el).find('img').attr('alt') || 'No title';
      const videoPath = $(el).attr('href') || '';
      const videoThumbnail = $(el).find('img').attr('src') || '';

      if (videoPath.startsWith('/watch?v=')) {
        relatedVideos.push({
          title: videoTitle,
          url: `https://www.youtube.com${videoPath}`,
          thumbnail: videoThumbnail
        });
      }
    });

    const result = { title, thumbnail, duration, relatedVideos };

    console.log('Scraped Video Details:', result);
    return result;
  } catch (error) {
    console.error('Error scraping YouTube:', error.message);
    throw new Error('Failed to fetch video details');
  }
}



}
