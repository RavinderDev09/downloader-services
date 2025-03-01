#!/bin/sh
echo "🚀 Installing dependencies..."

# Render पर Python और FFmpeg इंस्टॉल करें
apt-get update && apt-get install -y python3 python3-pip ffmpeg

# yt-dlp को Python PIP से इंस्टॉल करें
pip3 install --upgrade yt-dlp

echo "✅ Python, yt-dlp & FFmpeg Installed Successfully!"
