let selectedVideoUrl = "";

async function fetchVideos() {
    const query = document.getElementById('searchQuery').value;
    if (!query) {
        alert("Please enter a search term!");
        return;
    }
    document.getElementById('results').innerHTML = "<p>Loading...</p>";
    try {
        const response = await fetch(`http://localhost:4000/youtube/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (!data.video || data.video.length === 0) {
            document.getElementById('results').innerHTML = "<p>No results found.</p>";
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
        document.getElementById('results').innerHTML = "<p>Error fetching data.</p>";
    }
}

function openDownloadModal(videoUrl) {
    selectedVideoUrl = videoUrl;
    document.getElementById('downloadModal').style.display = "flex";
}

function closeModal() {
    document.getElementById('downloadModal').style.display = "none";
}

function startDownload(format) {
    window.location.href = `http://localhost:4000/youtube/download?url=${encodeURIComponent(selectedVideoUrl)}&format=${format}`;
    closeModal();
}



document.addEventListener("DOMContentLoaded", () => {
    const modal = document.createElement("div");
    modal.id = "downloadModal";
    modal.className = "modal";
    modal.style.display = "none";
    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h2>Select Download Format</h2>
            <button onclick="startDownload('mp4')">Download MP4</button>
            <button onclick="startDownload('mp3')">Download MP3</button>
            <br>
            <button onclick="closeModal()">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);
});



