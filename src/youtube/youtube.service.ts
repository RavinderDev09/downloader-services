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


async getVideoDetails(videoUrl: string) {
  try {
    console.log('videourl', videoUrl);
    
    const { data } = await axios.get(videoUrl);
    const $ = cheerio.load(data);

    // Extract video details
    const title = $('meta[name="title"]').attr('content') || '';
    const thumbnail = $('meta[property="og:image"]').attr('content') || '';
    const duration = $('meta[itemprop="duration"]').attr('content') || '';

    // Extract related videos
    const relatedVideos: { title: string; url: string; thumbnail: string }[] = [];
    $('a#thumbnail').each((i, el) => {
      const videoTitle = $(el).find('img').attr('alt') || 'No title';
      const videoUrl = 'https://www.youtube.com' + $(el).attr('href');
      const videoThumbnail = $(el).find('img').attr('src') || '';

      relatedVideos.push({ title: videoTitle, url: videoUrl, thumbnail: videoThumbnail });
    });

    const result =  { title, thumbnail, duration, relatedVideos };
    console.log('reuslt',result);
    return result
    
  } catch (error) {
    console.error('Error scraping YouTube:', error);
    throw new Error('Failed to fetch video details');
  }
}


async downloadVideo(youtubeUrl: string, format: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(this.downloadDirectory)) {
      return reject("Error: Download directory does not exist!");
    }

    const fileExtension = format === 'mp3' ? 'mp3' : 'mp4';
    const outputPattern = path.join(this.downloadDirectory, `%(title)s.${fileExtension}`);
    const command =
      format === 'mp3'
        ? `"${this.ytDlpPath}" -f "bestaudio" --extract-audio --audio-format mp3 -o "${outputPattern}" ${youtubeUrl}`
        : `"${this.ytDlpPath}" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]" --merge-output-format mp4 -o "${outputPattern}" ${youtubeUrl}`;

    console.log("Executing command:", command);

    exec(command, (error, stdout, stderr) => {
      console.log("yt-dlp stdout:", stdout);
      console.log("yt-dlp stderr:", stderr);

      if (error || stderr.includes("ERROR")) {
        return reject(`Download error: ${stderr || error.message}`);
      }

      // ✅ Ensure the merged file exists before returning it
      setTimeout(() => {
        const files = fs.readdirSync(this.downloadDirectory)
          .map(file => ({
            name: file,
            time: fs.statSync(path.join(this.downloadDirectory, file)).mtime.getTime(),
          }))
          .sort((a, b) => b.time - a.time);

        const downloadedFile = files.find(file => file.name.endsWith(`.${fileExtension}`))?.name;

        if (!downloadedFile) {
          return reject(`Download failed: No ${fileExtension} file found.`);
        }

        resolve(path.join(this.downloadDirectory, downloadedFile));
      }, 3000); // Wait 3 seconds to ensure merging is complete
    });
  });
}


// async downloadVideo(youtubeUrl: string, format: string): Promise<string> {
//   return new Promise((resolve, reject) => {
//     const fileExtension = format === 'mp3' ? 'mp3' : 'mp4';
//     const outputPattern = path.join(this.downloadDirectory, `%(title)s.${fileExtension}`);

//     // ✅ Single command that handles both MP3 and MP4 downloads
//     const ytDlpPath = "C:\\Users\\Asus\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\yt-dlp.exe"; // Replace with your actual path

//     const command =
//   format === 'mp3'
//     ? `"${ytDlpPath}" -f "bestaudio" --extract-audio --audio-format mp3 -o "${outputPattern}" ${youtubeUrl}`
//     : `"${ytDlpPath}" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]" --merge-output-format mp4 -o "${outputPattern}" ${youtubeUrl}`;

//     console.log('Executing command:', command);

//     exec(command, (error, stdout, stderr) => {
//       console.log('yt-dlp stdout:', stdout);
//       console.log('yt-dlp stderr:', stderr);

//       if (error) {
//         return reject(`Download error: ${stderr || error.message}`);
//       }

//       // ✅ Check for the final downloaded file (MP3 or MP4)
//       const files = fs.readdirSync(this.downloadDirectory);
//       const downloadedFile = files.find(file => file.endsWith(`.${fileExtension}`));

//       if (!downloadedFile) {
//         return reject(`Download failed: No ${fileExtension} file found.`);
//       }

//       resolve(path.join(this.downloadDirectory, downloadedFile));
//     });
//   });
// }




}
