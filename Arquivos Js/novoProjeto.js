document.getElementById('iconPreview').addEventListener('click', function() {
    document.getElementById('projectIcon').click();
});

function previewIcon(event) {
    const iconPreview = document.getElementById('iconPreview');
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function() {
        iconPreview.style.backgroundImage = `url(${reader.result})`;
        iconPreview.style.backgroundSize = 'cover';
    };

    if (file) {
        reader.readAsDataURL(file);
    }
}

function createProject() {
    const projectName = document.getElementById('projectName').value.trim();
    const orientation = document.getElementById('orientation').value;
    const projectIcon = document.getElementById('projectIcon').files[0]; // Captura o ícone do projeto

    if (!projectName) {
        alert("Nome do projeto é obrigatório.");
        return;
    }

    if (!orientation) {
        alert("Escolha a orientação do projeto.");
        return;
    }

    if (!projectIcon) {
        alert("Selecione um ícone para o projeto.");
        return;
    }

    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos';
    const filePath = directoryPath + '/projetos.json';

    const reader = new FileReader();
    reader.onload = function() {
        const iconData = reader.result; // Base64 da imagem

        try {
            // Verifica e cria o diretório, se necessário
            if (!Android.directoryExists(directoryPath)) {
                Android.createDirectory(directoryPath, "");
            }

            let projetos = [];
            // Verifica se o arquivo existe e lê o conteúdo
            if (Android.fileExists(filePath)) {
                const projetosJSON = Android.readFile(filePath);
                if (projetosJSON && projetosJSON.trim() !== "" && projetosJSON !== "File not found") {
                    projetos = JSON.parse(projetosJSON) || [];
                }
            } else {
                // Se o arquivo não existir, cria um novo arquivo com um array vazio
                Android.createFile(directoryPath, 'projetos.json', JSON.stringify([]));
            }

            // Verifica se o nome do projeto já existe
            const projetoExistente = projetos.some(projeto => projeto.nome === projectName);
            if (projetoExistente) {
                alert('Já existe um projeto com esse nome.');
                return;
            }

            const novoProjeto = {
                id: Date.now(),
                nome: projectName,
                orientacao: orientation,
                icone: iconData, // Armazena o ícone como base64
                objects: [] // Inicializa o array de objetos
            };

            // Adiciona o novo projeto à lista existente
            projetos.push(novoProjeto);

            // Atualiza o arquivo com a lista de projetos (projetos antigos + novo projeto)
            Android.writeFile(filePath, JSON.stringify(projetos));

            // Adiciona o objeto "Fundo" ao novo projeto
            addFundoObject(novoProjeto.id);
        } catch (e) {
            console.error("Erro ao manipular o arquivo de projetos:", e);
            alert("Erro ao manipular o arquivo de projetos.");
        }
    };

    // Lê o ícone como base64
    reader.readAsDataURL(projectIcon);
}

function addFundoObject(projetoId) {
    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos';
    const filePath = directoryPath + '/projetos.json';

    try {
        let projetos = [];
        // Verifica se o arquivo existe e lê o conteúdo
        if (Android.fileExists(filePath)) {
            const projetosJSON = Android.readFile(filePath);
            if (projetosJSON && projetosJSON.trim() !== "" && projetosJSON !== "File not found") {
                projetos = JSON.parse(projetosJSON) || [];
            }
        } else {
            alert("Arquivo de projetos não encontrado.");
            return;
        }

        const projetoIndex = projetos.findIndex(proj => proj.id === projetoId);
        if (projetoIndex === -1) {
            alert("Projeto não encontrado.");
            return;
        }

        const novoObjeto = {
            name: "Fundo",
            sprite: "null.png"
        };

        // Verifica se o objeto "Fundo" já existe
        const objetoJaExiste = projetos[projetoIndex].objects.some(obj => obj.name === novoObjeto.name);
        if (!objetoJaExiste) {
            projetos[projetoIndex].objects.push(novoObjeto);

            // Atualiza o arquivo com a lista de projetos (com o novo objeto "Fundo")
            Android.writeFile(filePath, JSON.stringify(projetos));
        }

        acessarProjeto(projetoId);
    } catch (e) {
        console.error("Erro ao adicionar o objeto 'Fundo':", e);
        alert("Erro ao adicionar o objeto 'Fundo'.");
    }
}

function acessarProjeto(projetoId) {
    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos';
    const filePath = directoryPath + '/projetos.json';

    try {
        let projetos = [];
        // Verifica se o arquivo existe e lê o conteúdo
        if (Android.fileExists(filePath)) {
            const projetosJSON = Android.readFile(filePath);
            if (projetosJSON && projetosJSON.trim() !== "" && projetosJSON !== "File not found") {
                projetos = JSON.parse(projetosJSON) || [];
            }
        } else {
            alert("Arquivo de projetos não encontrado.");
            return;
        }

        const projeto = projetos.find(proj => proj.id === projetoId);

        if (projeto) {
            window.location.replace(`projeto.html?projetoIndex=${projetos.indexOf(projeto)}`);
        } else {
            alert("Projeto não encontrado.");
        }
    } catch (e) {
        console.error("Erro ao ler o arquivo de projetos:", e);
        alert("Erro ao ler o arquivo de projetos.");
    }
}