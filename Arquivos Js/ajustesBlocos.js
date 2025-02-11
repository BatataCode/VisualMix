// Gerar chave única com base no projeto e script
function getStorageKey() {
  const { projetoIndex, scriptIndex } = getQueryParams();
  return `scrollPosition_${projetoIndex}_${scriptIndex}`;
}

// Quando a página é carregada
window.onload = function() {
    setTimeout(function() {
        const key = getStorageKey();
        const scrollPosition = localStorage.getItem(key);
        if (scrollPosition) {
            document.querySelector('.scene').scrollTop = parseInt(scrollPosition, 10);
        }
    }, 11);
};

// Quando o usuário sai da página
window.onbeforeunload = function() {
  const key = getStorageKey();
  const scrollPosition = document.querySelector('.scene').scrollTop;
  localStorage.setItem(key, scrollPosition);
};

const dropzone = document.getElementById('scene2');
let placeholder;

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    
    const blockId = event.dataTransfer.getData('text/plain');
    const block = document.getElementById(blockId);

    if (!block) return; // Garante que o bloco existe

    if (placeholder && placeholder.parentNode === dropzone) {
        dropzone.insertBefore(block, placeholder);
    } else {
        dropzone.appendChild(block);
    }

    block.classList.remove('dragging'); // Remove a classe de arrasto

    if (placeholder) {
        placeholder.remove();
        placeholder = null;
    }

    saveBlocksToLocalStorage(); // Salva a nova ordem dos blocos
}

function createBlock(blockUID, blockData) {
    const block = document.createElement('div');
    block.className = 'block';
    block.id = blockUID;
    block.innerHTML = blockData.content;

    if (blockData.backgroundColor) {
        block.style.backgroundColor = blockData.backgroundColor;
    }

    // Adiciona valores nos inputs
    const inputs = block.querySelectorAll('input');
    inputs.forEach((input, index) => {
        input.value = blockData.values[index]?.value || '';
        input.addEventListener('click', function() {
            editarInput(blockUID, index);
        });
    });

    // Adiciona valores nos selects
    const selects = block.querySelectorAll('select');
    selects.forEach((select, index) => {
        select.value = blockData.values[inputs.length + index]?.value || '';
        select.addEventListener('change', function() {
            blockData.values[inputs.length + index].value = select.value;
            saveBlocksToLocalStorage();
        });
    });

    // Listener para toque (touch) e long press
    block.addEventListener('touchstart', function (event) {
    const startTime = new Date().getTime();

    function checkLongPress() {
        const endTime = new Date().getTime();
        const touchDuration = endTime - startTime;
        if (touchDuration >= 500) { // Ajuste para 500ms
            showContextMenu(block, blockUID, event);
        }
    }

    const pressTimer = setTimeout(checkLongPress, 500);

    block.addEventListener('touchend', function () {
        clearTimeout(pressTimer);
    });

    block.addEventListener('touchmove', function () {
        clearTimeout(pressTimer);
    });
});

    block.addEventListener('dragstart', function(e) {
        const blockData = {
            id: block.id,
            content: block.innerHTML,
            values: getInputValues(block)
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(blockData));
    });

    return block;
}

function showContextMenu(block, blockUID, event) {  
    // Remove qualquer menu anterior  
    const existingMenu = document.getElementById('context-menu');  
    if (existingMenu) {  
        existingMenu.remove();  
    }  
  
    // Cria o menu de contexto  
    const menu = document.createElement('div');  
    menu.id = 'context-menu';  
    menu.className = 'context-menu';  
    menu.style.position = 'absolute';  
    menu.style.visibility = 'hidden'; // Escondemos temporariamente para calcular a largura  

    document.body.appendChild(menu); // Adiciona antes para obter tamanho corretamente  

    // Opções do menu  
    const moveOption = document.createElement('div');  
    moveOption.innerText = 'Mover';  
    moveOption.onclick = function () {  
        enableDrag(block);  
        menu.remove();  
    };  

    const copyOption = document.createElement('div');  
    copyOption.innerText = 'Copiar';  
    copyOption.onclick = function () {  
        copyBlock(block);  
        menu.remove();  
    };  

    const deleteOption = document.createElement('div');  
    deleteOption.innerText = 'Excluir';  
    deleteOption.onclick = function () {  
        if (confirm('Deseja apagar este bloco?')) {  
            deleteBlock(blockUID);  
        }  
        menu.remove();  
    };  

    menu.appendChild(moveOption);  
    menu.appendChild(copyOption);  
    menu.appendChild(deleteOption);  

    // Aguarde o menu ser renderizado para obter a largura correta  
    setTimeout(() => {  
        const touchX = event.touches[0].clientX;  
        const touchY = event.touches[0].clientY;  
        const menuWidth = menu.offsetWidth;  

        menu.style.top = `${touchY}px`;  
        menu.style.left = `${touchX - menuWidth}px`; // Move o menu para a esquerda  
        menu.style.visibility = 'visible'; // Agora torna o menu visível  
    }, 0);  

    // Remove o menu se o usuário clicar em outro lugar  
    document.addEventListener('click', function removeMenu() {  
        menu.remove();  
        document.removeEventListener('click', removeMenu);  
    });  
}

// Função para ativar a movimentação do bloco
function enableDrag(block) {
    block.setAttribute('draggable', 'true');

    block.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('text/plain', block.id);
        block.classList.add('dragging');
    });

    block.addEventListener('dragend', function () {
        block.classList.remove('dragging');
        block.removeAttribute('draggable');
    });
}

// Corrigindo o evento `drop` para mover o bloco corretamente
dropzone.addEventListener('drop', function(event) {  
    event.preventDefault();  
      
    const blockId = event.dataTransfer.getData('text/plain');  
    const block = document.getElementById(blockId);  
  
    if (block) {  
        const rect = dropzone.getBoundingClientRect();  
        const offsetY = event.clientY - rect.top;  
        const beforeNode = getBlockBeforeNode(offsetY);  
  
        if (beforeNode) {  
            dropzone.insertBefore(block, beforeNode);  
        } else {  
            dropzone.appendChild(block);  
        }  
  
        saveBlocksToLocalStorage();  
    }  
});

function saveBlocksToLocalStorage() {
    const blocks = [];
    dropzone.querySelectorAll('.block').forEach(block => {
        const blockData = {
            id: block.id,
            content: block.innerHTML,
            values: getInputValues(block),
            backgroundColor: block.style.backgroundColor
        };
        blocks.push(blockData);
    });

    const urlParams = new URLSearchParams(window.location.search);
    const projetoIndex = urlParams.get('projetoIndex');
    const scriptIndex = urlParams.get('objectIndex');
    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos/';
    const scriptKey = `${directoryPath}scripts-${projetoIndex}-${scriptIndex}.json`;

    Android.writeFile(scriptKey, JSON.stringify(blocks));
}

function loadBlocksFromLocalStorage() {
    const urlParams = new URLSearchParams(window.location.search);
    const projetoIndex = urlParams.get('projetoIndex');
    const scriptIndex = urlParams.get('objectIndex');

    if (projetoIndex === null || scriptIndex === null) {
        return;
    }

    const directoryPath = '/storage/emulated/0/Download/VisualMix/Arquivos/';
    const scriptKey = `${directoryPath}scripts-${projetoIndex}-${scriptIndex}.json`;

    const blocksString = Android.readFile(scriptKey);
    if (blocksString) {
        const blocks = JSON.parse(blocksString);
        blocks.forEach(blockData => {
            const block = createBlock(blockData.id, blockData);
            dropzone.appendChild(block);
        });
    } else {
        Android.writeFile(scriptKey, JSON.stringify([]));
    }
}

function deleteBlock(blockUID) {
    const block = document.getElementById(blockUID);
    if (block) {
        block.remove();
        saveBlocksToLocalStorage();
    }
}

function getInputValues(block) {
    const inputValues = [];
    const inputs = block.querySelectorAll('input');
    const selects = block.querySelectorAll('select');

    inputs.forEach(input => {
        inputValues.push({ type: 'input', id: input.id, value: input.value });
    });

    selects.forEach(select => {
        inputValues.push({ type: 'select', id: select.id, value: select.value });
    });

    return inputValues;
}

function createPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.className = 'placeholder';
    placeholder.style.height = '50px';  // Define uma altura padrão para o placeholder
    return placeholder;
}

dropzone.addEventListener('dragover', function(event) {
    event.preventDefault();
    if (!placeholder) {
        placeholder = createPlaceholder();
    }

    const rect = dropzone.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;

    let beforeNode = null;
    const children = Array.from(dropzone.children).filter(child => child.classList.contains('block'));
    for (let child of children) {
        const childRect = child.getBoundingClientRect();
        if (offsetY < childRect.top + childRect.height / 2) {
            beforeNode = child;
            break;
        }
    }

    if (beforeNode) {
        dropzone.insertBefore(placeholder, beforeNode);
    } else {
        dropzone.appendChild(placeholder);
    }

    const scrollOffset = 50;
    if (event.clientY < rect.top + scrollOffset) {
        dropzone.scrollTop -= scrollOffset;
    } else if (event.clientY > rect.bottom - scrollOffset) {
        dropzone.scrollTop += scrollOffset;
    }
});

dropzone.addEventListener('dragleave', function(event) {
    const relatedTarget = event.relatedTarget;
    if (!relatedTarget || !dropzone.contains(relatedTarget)) {
        if (placeholder) {
            placeholder.remove();
            placeholder = null;
        }
    }
});

dropzone.addEventListener('drop', function(event) {
    event.preventDefault();
    
    // Remover o placeholder antes de qualquer outra ação
    if (placeholder) {
        placeholder.remove();
        placeholder = null;
    }

    const data = event.dataTransfer.getData('text/plain');
    
    // Verificar se os dados transferidos contêm o ID de um bloco
    let block;
    try {
        const blockData = JSON.parse(data);
        const blockUID = generateUUID();
        block = createBlock(blockUID, blockData);  // Cria um novo bloco
    } catch {
        block = document.getElementById(data); // Se não, busca pelo ID diretamente
    }

    if (!block) return; // Garante que o bloco exista

    const rect = dropzone.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const beforeNode = getBlockBeforeNode(offsetY);

    // Insere o bloco na posição correta, antes de outro bloco ou no final
    if (beforeNode) {
        dropzone.insertBefore(block, beforeNode);
    } else {
        dropzone.appendChild(block);
    }

    saveBlocksToLocalStorage();  // Salva a nova ordem
});

function copyBlock(block) {
    const blockUID = generateUUID(); // Gera um novo UID para o bloco copiado
    const blockData = {
        content: block.innerHTML,
        values: getInputValues(block),
        backgroundColor: block.style.backgroundColor
    };

    const newBlock = createBlock(blockUID, blockData); // Cria o novo bloco

    // Insere o novo bloco logo abaixo do bloco original
    dropzone.insertBefore(newBlock, block.nextSibling);
    
    saveBlocksToLocalStorage(); // Salva a nova lista de blocos no localStorage
}

function getBlockBeforeNode(offsetY) {
    const children = Array.from(dropzone.children).filter(child => child.classList.contains('block'));
    for (let child of children) {
        const childRect = child.getBoundingClientRect();
        if (offsetY < childRect.top + childRect.height / 2) {
            return child;
        }
    }
    return null;
}

function editarInput(blockUID, index) {
    const { projetoIndex, scriptIndex } = getQueryParams();
    window.location.href = `editor1.html?projetoIndex=${projetoIndex}&scriptIndex=${scriptIndex}&blockUID=${blockUID}&index=${index}`;
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        projetoIndex: params.get('projetoIndex'),
        scriptIndex: params.get('objectIndex')
    };
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        loadBlocksFromLocalStorage();
    }, 10);
});
