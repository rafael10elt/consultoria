// netlify/functions/api.js

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Pega as variáveis de ambiente seguras
    const API_URL_BASE = process.env.NOCODB_API_URL;
    const API_TOKEN = process.env.NOCODB_API_TOKEN;

    // Pega o resto do caminho da URL que o cliente tentou acessar
    // Ex: se o cliente chamou /api/Consultores, apiPath será "Consultores"
    const apiPath = event.path.replace('/.netlify/functions/api/', '');

    // --- INÍCIO DA CORREÇÃO ---
    // Constrói a string de parâmetros de consulta a partir do evento
    const queryString = event.queryStringParameters ? `?${new URLSearchParams(event.queryStringParameters).toString()}` : '';
    
    // Monta a URL final completa, incluindo a base, o caminho e os parâmetros
    const fullNocoDBUrl = `${API_URL_BASE}/${apiPath}${queryString}`;
    // --- FIM DA CORREÇÃO ---

    try {
        const response = await fetch(fullNocoDBUrl, {
            method: event.httpMethod,
            headers: {
                'Content-Type': 'application/json',
                'xc-token': API_TOKEN,
            },
            body: event.body // Repassa o corpo da requisição original (para POST, PATCH, etc.)
        });

        // Se a resposta do NocoDB não for OK, repassa o erro
        if (!response.ok) {
            const errorData = await response.json();
            return {
                statusCode: response.status,
                body: JSON.stringify(errorData)
            };
        }

        const data = await response.json();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Erro na função Netlify:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Falha ao processar a requisição na função do servidor.',
                details: error.message
            })
        };
    }
};