let selectedVideoUrl = "";

console.log('open railway');

// 🟢 1️⃣ URL से वीडियो जानकारी लाना
async function fetchVideo() {
    const videoUrl = document.getElementById('videoUrl').value;
    if (!videoUrl) {
        alert("कृपया एक YouTube URL दर्ज करें!");
        return;
    }

    document.getElementById('videoPreview').innerHTML = "<p>Loading...</p>";

    try {
        // const response = await fetch(`http://localhost:4000/youtube/url?url=${encodeURIComponent(videoUrl)}/`)
        const response = await fetch(`https://downloader-services-production.up.railway.app/youtube/url?url=${encodeURIComponent(videoUrl)}`);
        if (!response.ok) {
            throw new Error("सर्वर से गलत प्रतिक्रिया मिली");
        }
        const data = await response.json();

        console.log("🔵 API Response:", data);

        if (!data.title) {
            document.getElementById('videoPreview').innerHTML = "<p>वीडियो नहीं मिला।</p>";
            return;
        }

        let videoDetailsHtml = `
            <div class="video-card">
                <img src="${data.thumbnail}" alt="${data.title}">
                <p><strong>Title:</strong> ${data.title}</p>
                <p><strong>Length:</strong> ${data.duration}</p>
                <button onclick="openDownloadModal('${videoUrl}')">Download</button>
            </div>
        `;

        if (data.relatedVideos && data.relatedVideos.length > 0) {
            videoDetailsHtml += `<h3>Related Videos</h3><div id="relatedVideos">`;
            videoDetailsHtml += data.relatedVideos.map(video => `
                <div class="video-card">
                    <img src="${video.thumbnail}" alt="${video.title}">
                    <p>${video.title}</p>
                    <button onclick="fetchVideoFromRelated('${video.url}')">View Details</button>
                </div>
            `).join('');
            videoDetailsHtml += `</div>`;
        }

        document.getElementById('videoPreview').innerHTML = videoDetailsHtml;
    } catch (error) {
        console.error("⛔ Error fetching video:", error);
        document.getElementById('videoPreview').innerHTML = "<p>वीडियो डेटा लाने में त्रुटि हुई।</p>";
    }
}

// 🟢 2️⃣ सर्च से वीडियो खोजें
async function fetchVideos() {
    const query = document.getElementById('searchQuery').value;
    if (!query) {
        alert("कृपया एक खोज शब्द दर्ज करें!");
        return;
    }
    document.getElementById('results').innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch(`https://downloader-services-production.up.railway.app/youtube/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error("सर्वर से गलत प्रतिक्रिया मिली");
        }
        const data = await response.json();

        console.log("🔵 API Response:", data);

        if (!data.video || data.video.length === 0) {
            document.getElementById('results').innerHTML = "<p>कोई परिणाम नहीं मिला।</p>";
            return;
        }

        document.getElementById('results').innerHTML = data.video.map(video => `
            <div class="video-card">
                <img src="${video.thumbnail}" alt="${video.title}">
                <p>${video.title}</p>
                <button onclick="openDownloadModal('${video.url}')">Download</button>
            </div>
        `).join('');
    } catch (error) {
        console.error("⛔ Error fetching videos:", error);
        document.getElementById('results').innerHTML = "<p>डेटा लाने में त्रुटि हुई।</p>";
    }
}

// 🔴 डाउनलोड मोडल
function openDownloadModal(videoUrl) {
    selectedVideoUrl = videoUrl;
    document.getElementById('downloadModal').style.display = "block";
}

function closeModal() {
    document.getElementById('downloadModal').style.display = "none";
}

function startDownload(format) {
    window.location.href = `https://downloader-services-uysd.onrender.com/download/url?url=${encodeURIComponent(selectedVideoUrl)}&format=${format}`;
    closeModal();
}

// 🔵 पेज लोड होने के बाद बटन को एक्टिव करना
document.addEventListener("DOMContentLoaded", () => {
    const fetchVideoButton = document.getElementById('fetchVideoButton');
    const fetchSearchButton = document.getElementById('fetchSearchButton');

    if (fetchVideoButton) {
        fetchVideoButton.addEventListener('click', fetchVideo);
    } else {
        console.error("❌ 'fetchVideoButton' नहीं मिला!");
    }

    if (fetchSearchButton) {
        fetchSearchButton.addEventListener('click', fetchVideos);
    } else {
        console.error("❌ 'fetchSearchButton' नहीं मिला!");
    }
});
