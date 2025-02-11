document.getElementById('iconPreview').addEventListener('click', function() {
    document.getElementById('objectIcon').click();
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

function createObject() {
    const objectName = document.getElementById('objectName').value.trim();
    const objectIcon = document.getElementById('objectIcon').files[0];

    if (!objectName) {
        alert('Por favor, insira um nome para o objeto.');
        return;
    }

    if (!objectIcon) {
        alert('Por favor, selecione um ícone para o objeto.');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const projetoIndex = urlParams.get('projetoIndex');

    if (!projetoIndex) {
        alert('Projeto não selecionado.');
        return;
    }

    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos';
    const filePath = directoryPath + '/projetos.json';

    let projetos = [];
    try {
        const projetosJSON = Android.readFile(filePath);
        projetos = projetosJSON ? JSON.parse(projetosJSON) : [];
    } catch (e) {
        console.error("Erro ao ler o arquivo de projetos:", e);
        alert('Erro ao carregar projetos.');
        return;
    }

    if (!projetos[projetoIndex]) {
        alert('Projeto não encontrado.');
        return;
    }

    const objetos = projetos[projetoIndex].objects || [];
    const objectExists = objetos.some(obj => obj.name.toLowerCase() === objectName.toLowerCase());

    if (objectExists) {
        alert('Já existe um objeto com este nome. Por favor, escolha um nome diferente.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function() {
        const spriteData = reader.result;
        const newObject = { name: objectName, sprite: spriteData };

        objetos.push(newObject);
        projetos[projetoIndex].objects = objetos;

        const newScript = {
            id: `script_${Date.now()}`,
            name: `Script De ${objectName}`,
            blocks: []
        };

        if (!projetos[projetoIndex].scripts) {
            projetos[projetoIndex].scripts = [];
        }
        projetos[projetoIndex].scripts.push(newScript);

        try {
            Android.writeFile(filePath, JSON.stringify(projetos));

            const spriteFilePath = `${directoryPath}/sprites-${projetoIndex}-${objetos.length}.json`;
            const spriteFileContent = JSON.stringify([{
                url: spriteData,
                name: objectName
            }]);
            Android.writeFile(spriteFilePath, spriteFileContent);

            window.location.replace(`projeto.html?projetoIndex=${projetoIndex}`);
        } catch (e) {
            console.error("Erro ao salvar o projeto:", e);
            alert('Erro ao salvar o projeto.');
        }
    };

    reader.readAsDataURL(objectIcon);
}
