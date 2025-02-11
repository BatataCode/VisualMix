        function openTab(evt, tabName) {
            // Esconde todas as abas
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }

            // Remove a classe "active" de todas as abas
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }

            // Mostra a aba atual e adiciona a classe "active" ao botão da aba
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";
        }

        // Abre a primeira aba por padrão
        document.getElementsByClassName('tablinks')[0].click();


function adicionarBlocos() {
window.location.href = 'blocos.html';
}