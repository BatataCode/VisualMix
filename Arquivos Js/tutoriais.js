const API_KEY = 'AIzaSyDmigASL8OrbZKlNcmWgWZDIftoD7ppNdw';
        const CHANNEL_ID = 'UCbwmzEJl7ao5w6I2teuVDdQ';
        const maxResults = 10;

        fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${maxResults}`)
            .then(response => response.json())
            .then(data => {
                const videoContainer = document.getElementById('video-thumbnails');
                data.items.forEach(item => {
                    if (item.id.kind === 'youtube#video') {
                        const videoId = item.id.videoId;
                        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`; // URL padrão do YouTube
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
            .catch(error => console.error('Erro ao carregar vídeos:', error));