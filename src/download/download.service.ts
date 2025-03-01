import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { Response } from 'express';
import { exec } from 'youtube-dl-exec';


@Injectable()
export class DownloadService {
  async downloadVideo(videoUrl: string, res: Response) {
    try {
      if (!videoUrl || typeof videoUrl !== 'string') {
        throw new Error('अमान्य YouTube URL');
      }

      console.log('🎥 वीडियो डाउनलोड करने की प्रक्रिया शुरू: ', videoUrl);

      // Response के लिए HTTP हेडर सेट करें
      res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
      res.setHeader('Content-Type', 'video/mp4');

      // `yt-dlp` को कमांड-लाइन से चलाएँ
      const process = spawn('yt-dlp', ['-o', '-', '-f', 'best', videoUrl]);

      // आउटपुट को डायरेक्ट रिस्पॉन्स में भेजें (डायरेक्ट डाउनलोड)
      process.stdout.pipe(res);

      // एरर हैंडलिंग
      process.stderr.on('data', (data) => {
        console.error('❌ yt-dlp त्रुटि:', data.toString());
      });

      process.on('exit', (code) => {
        console.log(`✅ yt-dlp समाप्त, कोड: ${code}`);
      });

    } catch (error) {
      console.error('❌ डाउनलोड त्रुटि:', error.message);
      res.status(500).send(`वीडियो डाउनलोड करने में समस्या: ${error.message}`);
    }
  }

  // async downloadAudio(videoUrl: string, res: Response) {
  //   try {
  //     if (!videoUrl || typeof videoUrl !== 'string') {
  //       throw new Error('अमान्य YouTube URL');
  //     }

  //     console.log('🎵 ऑडियो डाउनलोड शुरू: ', videoUrl);

  //     // Response के लिए HTTP हेडर सेट करें
  //     res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
  //     res.setHeader('Content-Type', 'audio/mpeg');

  //     // `yt-dlp` को MP3 डाउनलोड के लिए कमांड-लाइन से चलाएँ
  //     const process = spawn('yt-dlp', ['-o', '-', '-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', videoUrl]);

  //     // आउटपुट को डायरेक्ट रिस्पॉन्स में भेजें (डायरेक्ट MP3 डाउनलोड)
  //     process.stdout.pipe(res);

  //     // एरर हैंडलिंग
  //     process.stderr.on('data', (data) => {
  //       console.error('❌ yt-dlp त्रुटि:', data.toString());
  //     });

  //     process.on('exit', (code) => {
  //       console.log(`✅ yt-dlp समाप्त, कोड: ${code}`);
  //     });

  //   } catch (error) {
  //     console.error('❌ डाउनलोड त्रुटि:', error.message);
  //     res.status(500).send(`MP3 डाउनलोड करने में समस्या: ${error.message}`);
  //   }
  // }


  //2sw
  async downloadAudio(videoUrl: string, res: Response) {
    try {
      if (!videoUrl || typeof videoUrl !== 'string') {
        throw new Error('अमान्य YouTube URL');
      }

      console.log('🎵 ऑडियो डाउनलोड शुरू: ', videoUrl);

      // HTTP हेडर सेट करें
      res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
      res.setHeader('Content-Type', 'audio/mpeg');

      // Render पर yt-dlp को Python से कॉल करें
      const process = spawn('python3', ['-m', 'yt_dlp', '-o', '-', '-f', 'bestaudio', '--extract-audio', '--audio-format', 'mp3', videoUrl]);

      process.stdout.pipe(res);

      process.stderr.on('data', (data) => {
        console.error('❌ yt-dlp त्रुटि:', data.toString());
      });

      process.on('exit', (code) => {
        console.log(`✅ yt-dlp समाप्त, कोड: ${code}`);
      });

    } catch (error) {
      console.error('❌ डाउनलोड त्रुटि:', error.message);
      res.status(500).send(`MP3 डाउनलोड करने में समस्या: ${error.message}`);
    }
  } 
}
