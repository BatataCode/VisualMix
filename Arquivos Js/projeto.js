document.addEventListener('DOMContentLoaded', function() { 
    const objectContainer = document.getElementById('objectContainer');

    // Recupera o índice do projeto da URL
    const urlParams = new URLSearchParams(window.location.search);
    const projetoIndex = urlParams.get('projetoIndex');

    // Verifica se o projeto index está disponível
    if (!projetoIndex) {
        alert('Projeto não selecionado.');
        return;
    }

    // Caminho do diretório e arquivo
    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos';
    const filePath = directoryPath + '/projetos.json';

    // Lê o conteúdo do arquivo usando Java
    let projetos = Android.readFile(filePath);
    try {
        projetos = JSON.parse(projetos);
    } catch (e) {
        alert('Erro ao ler os projetos.');
        return;
    }

    // Verifica se o projeto existe
    if (!projetos[projetoIndex]) {
        alert('Projeto não encontrado.');
        return;
    }

    let objects = projetos[projetoIndex]?.objects || [];

    // Exibe cada objeto do projeto atual
    objects.forEach(function(object, index) {
        const objElement = document.createElement('div');
        objElement.classList.add('objFundo');
        objElement.draggable = true;
        objElement.dataset.index = index;

        // Se o objeto é "Fundo", não adiciona o botão de exclusão
        const deleteButton = object.name !== "Fundo" ? `<button class="delete-btn" onclick="event.stopPropagation(); deleteObject(${index})">X</button>` : '';

        objElement.innerHTML = `
            <div class="sprite" style="background-image: url('${object.sprite}');"></div>
            <div>${object.name}</div>
            ${deleteButton}
        `;

        // Adiciona os eventos de arrastar e soltar
        objElement.addEventListener('dragstart', handleDragStart);
        objElement.addEventListener('dragover', handleDragOver);
        objElement.addEventListener('drop', handleDrop);
        objElement.addEventListener('dragleave', handleDragLeave);

        // Adiciona o evento click
        objElement.addEventListener('click', () => {
            goToScriptsPage(index);
        });

        objectContainer.appendChild(objElement);
    });

});

// Função de arrastar
function handleDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.index);
    event.target.classList.add('dragging');
}

function handleDragOver(event) {
    event.preventDefault(); // Necessário para permitir o drop
    const dropTarget = event.target.closest('.objFundo');
    if (dropTarget) {
        dropTarget.classList.add('over');
    }
}

function handleDrop(event) {
    event.preventDefault();
    const index = event.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`.objFundo[data-index='${index}']`);
    const dropTarget = event.target.closest('.objFundo');

    if (dropTarget && draggedElement !== dropTarget) {
        const container = draggedElement.parentElement;
        const draggedIndex = Array.from(container.children).indexOf(draggedElement);
        const dropIndex = Array.from(container.children).indexOf(dropTarget);

        // Remove o item arrastado do DOM
        container.removeChild(draggedElement);

        // Inserir o elemento arrastado antes ou depois do elemento alvo
        if (draggedIndex < dropIndex) {
            container.insertBefore(draggedElement, dropTarget.nextSibling);
        } else {
            container.insertBefore(draggedElement, dropTarget);
        }

        // Atualiza os índices no arquivo JSON
        let projetos = Android.readFile(filePath);
        projetos = JSON.parse(projetos);
        let projetoIndex = parseInt(new URLSearchParams(window.location.search).get('projetoIndex'));
        let objects = projetos[projetoIndex]?.objects || [];

        // Move o item na lista de objetos
        const [movedObject] = objects.splice(draggedIndex, 1);
        if (draggedIndex < dropIndex) {
            objects.splice(dropIndex, 0, movedObject);
        } else {
            objects.splice(dropIndex, 0, movedObject);
        }

        // Salva a atualização no arquivo JSON
        projetos[projetoIndex].objects = objects;
        Android.writeFile(filePath, JSON.stringify(projetos));
    }

    event.target.classList.remove('dragging');
    const allOverElements = document.querySelectorAll('.objFundo.over');
    allOverElements.forEach(element => element.classList.remove('over'));
}

function handleDragLeave(event) {
    event.target.classList.remove('over');
}

// Função para deletar objeto
function deleteObject(index) { 
    if (confirm("Tem certeza que deseja excluir este objeto e todas as sprites associadas?")) { 
        try { 
            // Recupera o índice do projeto da URL 
            const urlParams = new URLSearchParams(window.location.search); 
            const projetoIndex = parseInt(urlParams.get('projetoIndex'));

            if (isNaN(projetoIndex)) {
                throw new Error('Índice do projeto inválido.');
            }

            // Caminho do arquivo JSON
            const filePath = '/storage/emulated/0/Download/VisualMix/Arquivos/projetos.json';

            // Lê o conteúdo do arquivo de projetos
            let projetos = Android.readFile(filePath);
            projetos = JSON.parse(projetos);

            if (!projetos[projetoIndex]) {
                throw new Error('Projeto não encontrado.');
            }

            // Não permite a exclusão do objeto "Fundo"
            if (projetos[projetoIndex].objects[index].name === "Fundo") {
                alert('O objeto "Fundo" não pode ser excluído.');
                return;
            }

            // Remove o objeto do array
            const objetoRemovido = projetos[projetoIndex].objects.splice(index, 1)[0];

            if (!objetoRemovido) {
                throw new Error('Objeto não encontrado.');
            }

            // Remove o arquivo de sprites associado ao objeto
            const spriteFilePath = `/storage/emulated/0/Download/VisualMix/Arquivos/sprites-${projetoIndex}-${index}.json`;
            console.log(`Tentando excluir o arquivo de sprites: ${spriteFilePath}`);

            if (Android.fileExists(spriteFilePath)) {
                Android.deleteFile(spriteFilePath);
                console.log(`Arquivo de sprites excluído com sucesso: ${spriteFilePath}`);
            } else {
                console.log(`Arquivo de sprites não encontrado: ${spriteFilePath}`);
            }

            const scriptsFilePath = `/storage/emulated/0/Download/VisualMix/Arquivos/scripts-${projetoIndex}-${index}.json`;
            console.log(`Tentando excluir o arquivo de scripts: ${scriptsFilePath}`);

            if (Android.fileExists(scriptsFilePath)) {
                Android.deleteFile(scriptsFilePath);
                console.log(`Arquivo de scripts excluído com sucesso: ${scriptsFilePath}`);
            } else {
                console.log(`Arquivo de scripts não encontrado: ${scriptsFilePath}`);
            }

            // Atualiza o arquivo JSON de projetos
            Android.writeFile(filePath, JSON.stringify(projetos));
            console.log('Projeto atualizado com sucesso.');

            // Recarrega a página para refletir as mudanças
            location.reload();
        } catch (error) {
            console.error('Erro ao excluir o objeto:', error.message);
            alert('Ocorreu um erro ao excluir o objeto. Verifique o console para mais detalhes.');
        }
    }
}

// Função para navegar para a página de scripts
function goToScriptsPage(objectIndex) { 
    const urlParams = new URLSearchParams(window.location.search); 
    const projetoIndex = urlParams.get('projetoIndex');

    if (projetoIndex !== null) {
        window.location.href = `scripts.html?projetoIndex=${projetoIndex}&objectIndex=${objectIndex}`;
    } else {
        alert('Projeto não encontrado.');
    }
}

// Função para navegar para a página de novo objeto
function goToNewPage() { 
    const urlParams = new URLSearchParams(window.location.search); 
    const projetoIndex = urlParams.get('projetoIndex');
    window.location.href = `novoObjeto.html?projetoIndex=${projetoIndex}`;
}

// Função para mudar orientação
function mudarOrientacao(orientacao) { 
    Android.changeOrientation(orientacao); 
}

mudarOrientacao("portrait");

function executarJogo() {
    const urlParams = new URLSearchParams(window.location.search);
    const projetoIndex = urlParams.get('projetoIndex');

    if (!projetoIndex) {
        alert('Projeto não selecionado.');
        return;
    }

    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos';
    const filePath = directoryPath + '/projetos.json';

    let projetos = Android.readFile(filePath);
    try {
        projetos = JSON.parse(projetos);
    } catch (e) {
        alert('Erro ao ler os projetos.');
        return;
    }

    if (!projetos[projetoIndex]) {
        alert('Projeto não encontrado.');
        return;
    }

    const objects = projetos[projetoIndex]?.objects || [];
    const scriptsArray = [];
    const spritesArray = [];
    const audiosArray = [];

    objects.forEach(function(_, index) {
        const scriptFilePath = `${directoryPath}/scripts-${projetoIndex}-${index}.json`;
        const spriteFilePath = `${directoryPath}/sprites-${projetoIndex}-${index}.json`;
        const audioFilePath = `${directoryPath}/audios-${projetoIndex}-${index}.json`;

        if (Android.fileExists(scriptFilePath)) {
            let scriptContent = Android.readFile(scriptFilePath);
            try {
                scriptContent = JSON.parse(scriptContent);
            } catch (e) {
                console.error(`Erro ao ler o script do objeto ${index}:`, e);
                return;
            }
            scriptsArray.push(scriptContent);
        }

        if (Android.fileExists(spriteFilePath)) {
            let spriteContent = Android.readFile(spriteFilePath);
            try {
                spriteContent = JSON.parse(spriteContent);
            } catch (e) {
                console.error(`Erro ao ler o sprite do objeto ${index}:`, e);
                return;
            }
            spritesArray.push(spriteContent);
        }

        if (Android.fileExists(audioFilePath)) {
            let audioContent = Android.readFile(audioFilePath);
            try {
                audioContent = JSON.parse(audioContent);
            } catch (e) {
                console.error(`Erro ao ler o áudio do objeto ${index}:`, e);
                return;
            }
            audiosArray.push(audioContent);
        }
    });

    const scriptsFilePath = `${directoryPath}/executar-scripts.json`;
    const spritesFilePath = `${directoryPath}/allSprites.json`;
    const audiosFilePath = `${directoryPath}/allAudios.json`;

    Android.writeFile(scriptsFilePath, JSON.stringify(scriptsArray.flat()));
    Android.writeFile(spritesFilePath, JSON.stringify(spritesArray.flat()));
    Android.writeFile(audiosFilePath, JSON.stringify(audiosArray.flat()));

    window.location.href = `executarJogo.html?projetoIndex=${projetoIndex}&scriptsFilePath=${scriptsFilePath}&spritesFilePath=${spritesFilePath}&audiosFilePath=${audiosFilePath}`;
}

function GerarArquivo() {
const urlParams = new URLSearchParams(window.location.search);
    const projetoIndex = urlParams.get('projetoIndex');

    if (!projetoIndex) {
        alert('Projeto não selecionado.');
        return;
    }

    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos';
    const filePath = directoryPath + '/projetos.json';

    let projetos = Android.readFile(filePath);
    try {
        projetos = JSON.parse(projetos);
    } catch (e) {
        alert('Erro ao ler os projetos.');
        return;
    }

    if (!projetos[projetoIndex]) {
        alert('Projeto não encontrado.');
        return;
    }

    const objects = projetos[projetoIndex]?.objects || [];
    const scriptsArray = [];
    const spritesArray = [];
    const audiosArray = [];

    objects.forEach(function(_, index) {
        const scriptFilePath = `${directoryPath}/scripts-${projetoIndex}-${index}.json`;
        const spriteFilePath = `${directoryPath}/sprites-${projetoIndex}-${index}.json`;
        const audioFilePath = `${directoryPath}/audios-${projetoIndex}-${index}.json`;

        if (Android.fileExists(scriptFilePath)) {
            let scriptContent = Android.readFile(scriptFilePath);
            try {
                scriptContent = JSON.parse(scriptContent);
            } catch (e) {
                console.error(`Erro ao ler o script do objeto ${index}:`, e);
                return;
            }
            scriptsArray.push(scriptContent);
        }

        if (Android.fileExists(spriteFilePath)) {
            let spriteContent = Android.readFile(spriteFilePath);
            try {
                spriteContent = JSON.parse(spriteContent);
            } catch (e) {
                console.error(`Erro ao ler o sprite do objeto ${index}:`, e);
                return;
            }
            spritesArray.push(spriteContent);
        }

        if (Android.fileExists(audioFilePath)) {
            let audioContent = Android.readFile(audioFilePath);
            try {
                audioContent = JSON.parse(audioContent);
            } catch (e) {
                console.error(`Erro ao ler o áudio do objeto ${index}:`, e);
                return;
            }
            audiosArray.push(audioContent);
        }
    });
    const directoryPathh = '/storage/emulated/0/VisualMix Json';

// Verifica se a pasta existe, se não, cria
            if (!Android.directoryExists(directoryPathh)) {
                Android.createDirectory(directoryPathh, "");
            }

const scriptsFilePath = `${directoryPathh}/executar-scripts.json`;
const spritesFilePath = `${directoryPathh}/allSprites.json`;
const audiosFilePath = `${directoryPathh}/allAudios.json`;

Android.writeFile(scriptsFilePath, JSON.stringify(scriptsArray.flat()));
Android.writeFile(spritesFilePath, JSON.stringify(spritesArray.flat()));
Android.writeFile(audiosFilePath, JSON.stringify(audiosArray.flat()));
alert('Arquivo Salvo Com Sucesso Na Pasta (VisualMix Json).');
}

Android.stopAudio();
