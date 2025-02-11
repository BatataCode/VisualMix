document.addEventListener('DOMContentLoaded', () => {
    const projetoContainer = document.getElementById('projetoContainer');
    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos';
    const filePath = directoryPath + '/projetos.json';

    let projetos = [];
    
    try {
        const projetosJSON = Android.readFile(filePath);
        projetos = projetosJSON ? JSON.parse(projetosJSON) : [];
    } catch (e) {
        console.error("Erro ao ler o arquivo de projetos:", e);
    }

    if (projetos.length === 0) {
        projetoContainer.innerHTML = '<p>Nenhum projeto criado.</p>';
    } else {
        projetos.forEach((projeto, index) => {
            const projetoElement = document.createElement('div');
            projetoElement.classList.add('project-item');

            // Exibe o ícone do projeto
            const projectIcon = projeto.icone;  // Usa o ícone salvo

            projetoElement.innerHTML = `
                <img src="${projectIcon}" class="project-icon">
                <div class="project-title">${projeto.nome}</div>
                <button class="delete-button" onclick="deleteProject(event, ${index})">×</button>
            `;

            projetoElement.addEventListener('click', () => {
                window.location.href = `projeto.html?projetoIndex=${index}`;
            });

            projetoContainer.appendChild(projetoElement);
        });
    }
});

function goToNewPage() {
    window.location.href = "novoProjeto.html";
}

function deleteProject(event, index) {
    event.stopPropagation();

    // Pergunta ao usuário se ele realmente deseja excluir o projeto
    const confirmDelete = confirm('Você realmente deseja apagar este projeto? Esta ação não pode ser desfeita.');
    if (!confirmDelete) {
        return; // Se o usuário cancelar, a função será interrompida
    }

    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos';
    const filePath = directoryPath + '/projetos.json';

    try {
        // Lê o conteúdo do arquivo de projetos
        let projetosJSON = Android.readFile(filePath);
        let projetos = projetosJSON ? JSON.parse(projetosJSON) : [];

        if (index < 0 || index >= projetos.length) {
            throw new Error('Índice de projeto inválido.');
        }

        const projeto = projetos[index];

        // Remove o projeto do array
        projetos.splice(index, 1);

        // Atualiza o arquivo JSON dos projetos
        Android.writeFile(filePath, JSON.stringify(projetos));

        // Remove todos os objetos, sprites e scripts associados ao projeto
        if (projeto.objects) {
            projeto.objects.forEach((_, objIndex) => {
                // Excluir sprites
                const spriteFilePath = `/storage/emulated/0/Download/VisualMix/Arquivos/sprites-${index}-${objIndex + 1}.json`;
                if (Android.fileExists(spriteFilePath)) {
                    Android.deleteFile(spriteFilePath);
                    console.log(`Arquivo de sprites excluído com sucesso: ${spriteFilePath}`);
                }

                // Excluir scripts
                const scriptFilePath = `/storage/emulated/0/Download/VisualMix/Arquivos/scripts-${index}-${objIndex + 1}.json`;
                if (Android.fileExists(scriptFilePath)) {
                    Android.deleteFile(scriptFilePath);
                    console.log(`Arquivo de scripts excluído com sucesso: ${scriptFilePath}`);
                }
                
                const spriteFilePathh = `/storage/emulated/0/Download/VisualMix/Arquivos/sprites-${index}-0.json`;
                if (Android.fileExists(spriteFilePathh)) {
                    Android.deleteFile(spriteFilePathh);
                    console.log(`Arquivo de sprites excluído com sucesso: ${spriteFilePath}`);
                }
                
                const scriptFilePathh = `/storage/emulated/0/Download/VisualMix/Arquivos/scripts-${index}-0.json`;
                
                if (Android.fileExists(scriptFilePathh)) {
                    Android.deleteFile(scriptFilePathh);
                    console.log(`Arquivo de scripts excluído com sucesso: ${scriptFilePath}`);
                }
            });
        }

        console.log('Projeto, sprites e scripts associados excluídos com sucesso.');

        location.reload();

    } catch (e) {
        console.error("Erro ao manipular o arquivo de projetos:", e);
        alert('Ocorreu um erro ao excluir o projeto. Verifique o console para mais detalhes.');
    }
}
