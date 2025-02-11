const imageInput = document.getElementById('imageInput');
        const gallery = document.getElementById('gallery');
        const searchInput = document.getElementById('search');
        const backButton = document.getElementById('backButton');

        // Função para obter parâmetros da URL
        function getQueryParam(param) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param);
        }

        // Obtém o projetoIndex da URL
        const projetoIndex = getQueryParam('projetoIndex');

        imageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageData = e.target.result;

                    // Pergunta o nome da sprite
                    const spriteName = prompt("Digite o nome para a sprite:");

                    if (spriteName) {
                        if (!isSpriteNameExists(spriteName)) {
                            // Salvar a imagem com o nome da sprite no LocalStorage
                            saveImage(spriteName, imageData);

                            // Adicionar a imagem à galeria com o nome
                            addImageToGallery(spriteName, imageData);
                        } else {
                            alert("Já existe uma sprite com esse nome. Escolha um nome diferente.");
                        }
                    } else {
                        alert("Você deve fornecer um nome para a sprite.");
                    }

                    // Limpa o campo de entrada de arquivos
                    imageInput.value = '';
                };
                reader.readAsDataURL(file);
            }
        });

        function saveImage(name, imageData) {
            let projectImages = JSON.parse(localStorage.getItem(`images_${projetoIndex}`)) || [];
            projectImages = projectImages.filter(image => image.name !== name); // Remove imagem existente com o mesmo nome
            projectImages.push({ name: name, data: imageData });
            localStorage.setItem(`images_${projetoIndex}`, JSON.stringify(projectImages));
        }

        function isSpriteNameExists(name) {
            let projectImages = JSON.parse(localStorage.getItem(`images_${projetoIndex}`)) || [];
            return projectImages.some(image => image.name === name);
        }

        function loadImages() {
            let projectImages = JSON.parse(localStorage.getItem(`images_${projetoIndex}`)) || [];
            projectImages.forEach(image => {
                addImageToGallery(image.name, image.data);
            });
        }

        function addImageToGallery(name, imageData) {
            const container = document.createElement('div');
            container.className = 'sprite-container';
            container.dataset.name = name;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.textContent = '×';
            deleteButton.onclick = function() {
                if (confirm("Você tem certeza que deseja excluir esta sprite?")) {
                    deleteImage(name);
                    container.remove();
                }
            };

            const spriteInfo = document.createElement('div');
            spriteInfo.className = 'sprite-info';

            const img = document.createElement('img');
            img.className = 'sprite-image';
            img.src = imageData;

            const nameElement = document.createElement('div');
            nameElement.className = 'sprite-name';
            nameElement.textContent = name;

            spriteInfo.appendChild(nameElement);

            container.appendChild(deleteButton);
            container.appendChild(img);
            container.appendChild(spriteInfo);

            gallery.appendChild(container);
        }

        function deleteImage(name) {
            let projectImages = JSON.parse(localStorage.getItem(`images_${projetoIndex}`)) || [];
            projectImages = projectImages.filter(image => image.name !== name);
            localStorage.setItem(`images_${projetoIndex}`, JSON.stringify(projectImages));
            filterSprites(); // Atualiza a exibição após a exclusão
        }

        function filterSprites() {
            const searchText = searchInput.value.toLowerCase();
            const spriteContainers = gallery.querySelectorAll('.sprite-container');
            spriteContainers.forEach(container => {
                const spriteName = container.dataset.name.toLowerCase();
                if (spriteName.includes(searchText)) {
                    container.style.display = '';
                } else {
                    container.style.display = 'none';
                }
            });
        }

        // Carregar imagens salvas ao iniciar a página
        window.onload = function() {
            loadImages();
        };

        // Adiciona evento de pesquisa
        searchInput.addEventListener('input', filterSprites);

        // Adiciona funcionalidade ao botão "Voltar"
        backButton.addEventListener('click', function() {
            window.history.back();
        });