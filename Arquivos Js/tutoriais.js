const API_KEY = 'AIzaSyBEvG6VFHM0Kfqr1d9e6f5EUcNDuQ_1TmI';
const CHANNEL_ID = 'UCdadtJ1C8b0gSm80G37m4DQ';
const maxResults = 10;

fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${maxResults}`)
    .then(response => response.json())
    .then(data => {
        const videoContainer = document.getElementById('video-thumbnails');

        if (!data.items || data.items.length === 0) {
            videoContainer.innerHTML = '<p class="no-videos">Nenhum vídeo encontrado no momento.</p>';
            return;
        }

        data.items.forEach(item => {
            if (item.id.kind === 'youtube#video') {
                const videoId = item.id.videoId;
                const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
                const videoTitle = item.snippet.title;

                const videoElement = `
                    <div class="video">
                        <a href="${videoUrl}" target="_blank" rel="noopener noreferrer">
                            <img src="${thumbnailUrl}" alt="${videoTitle}">
                            <div class="video-title">${videoTitle}</div>
                        </a>
                    </div>
                `;
                videoContainer.innerHTML += videoElement;
            }
        });
    })
    .catch(error => {
        document.getElementById('video-thumbnails').innerHTML = '<p class="no-videos">Erro ao carregar vídeos.</p>';
    });
