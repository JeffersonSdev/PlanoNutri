// Função que consulta a Groq (quando não há resposta pronta)
// async function perguntarGroq(mensagemUsuario) {
//     const response = await fetch("http://localhost:3000/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: mensagemUsuario })
//     });

//     const data = await response.json();
//     return data.reply;
// }

// Chatbot no frontend
$(document).ready(function () {
    $("#send-btn").click(async function () {
        const userInput = $("#user-input").val().trim();
        if (userInput === "") return;

        // 1. Adiciona a mensagem do usuário
        $("#messages").append(`<div class="d-flex justify-content-end mb-3"><div class="user-message">${userInput}</div></div>`);
        $("#user-input").val("");

        // 2. Adiciona a mensagem "..."
        const thinkingMessageHtml = `
            <div class="d-flex justify-content-start mb-3 bot-thinking-message">
                <div class="bot-message">
                    <span class="thinking-dots">
                        <span class="dot">.</span>
                        <span class="dot">.</span>
                        <span class="dot">.</span>
                    </span>
                </div>
            </div>`;
        $("#messages").append(thinkingMessageHtml);
        
        $("#chat-window").scrollTop($("#chat-window")[0].scrollHeight);

        // 3. Procura pela resposta pronta
        let resposta = respostaPronta(userInput);

        //  Adiciona um atraso aleatório entre 0.5 e 1.5 segundos
        const delay = Math.floor(Math.random() * 1001) + 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        // 5. Remove a mensagem "..."
        $(".bot-thinking-message").remove();

        // 6. Decide qual resposta final mostrar
        if (resposta != null) {
            // Resposta pronta foi encontrada
            $("#messages").append(`<div class="d-flex justify-content-start mb-3"><div class="bot-message">${resposta}</div></div>`);
        } else {
            // Nenhuma resposta pronta
            // resposta = await perguntarGroq(userInput); // <- Descomente para usar a IA
            $("#messages").append(`<div class="d-flex justify-content-start mb-3"><div class="bot-message">Ainda não temos resposta para essa pergunta, estamos trabalhando para melhorar sua experiência!</div></div>`);
        }
        
        // 7. Rola o chat para a resposta final
        $("#chat-window").scrollTop($("#chat-window")[0].scrollHeight);
    });

    // Adiciona o evento de pressionar "Enter"
    $('#user-input').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            $("#send-btn").click(); // Dispara o evento de clique do botão
        }
    });
});

// Lista de perguntas e respostas para a busca inteligente
const faq = [
    {
        pergunta: "como adicionar produto na lista",
        resposta: "Para adicionar um produto, digite o nome e clique no botão ➕."
    },
    {
        pergunta: "como remover um item ou produto",
        resposta: "Clique no ícone 🗑️ ao lado do item que deseja excluir."
    },
    {
        pergunta: "posso editar a minha lista de compras",
        resposta: "Sim! Basta clicar sobre o item para editar o nome ou quantidade."
    },
    {
        pergunta: "o que é o aplicativo plano nutri",
        resposta: "É um app de lista de compras inteligente, feito para organizar suas compras de forma prática!"
    }
];

// 'keys: ['pergunta']' diz para ele buscar dentro do campo 'pergunta' do faq
const fuseOptions = {
    includeScore: true, // Inclui uma pontuação de relevância
    keys: ['pergunta'],
    threshold: 0.4 // Nível de tolerância: 0.0 = exato, 1.0 = qualquer coisa. (alucinação)
};

const fuse = new Fuse(faq, fuseOptions);

function respostaPronta(perguntaUsuario) {
    const resultado = fuse.search(perguntaUsuario);

    console.log("Resultado da busca:", resultado);

    if (resultado.length > 0) {
        // O primeiro item (resultado[0]) é sempre o mais relevante
        return resultado[0].item.resposta;
    }

    // Se não encontrou nada parecido, retorna null
    return null;
}
