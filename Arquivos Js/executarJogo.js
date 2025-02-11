function getProjectFromLocalStorage(index) {
    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos';
    const filePath = directoryPath + '/projetos.json';

    const projetosJSON = Android.readFile(filePath);
    const projetos = JSON.parse(projetosJSON);
    return projetos[index] || null;
}

function displayProjectDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const projetoIndex = urlParams.get('projetoIndex');
    const projeto = getProjectFromLocalStorage(projetoIndex);

    if (projeto) {
        mudarOrientacao(projeto.orientacao);
    }
}

function mudarOrientacao(orientacao) {
    Android.changeOrientation(orientacao);
}

displayProjectDetails();