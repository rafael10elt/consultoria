// netlify/functions/api.js
//
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    // Pega as variáveis de ambiente seguras
    const API_URL = process.env.NOCODB_API_URL;
    const API_TOKEN = process.env.NOCODB_API_TOKEN;

    // Pega o resto do caminho da URL que o cliente tentou acessar
    // Ex: se o cliente chamou /api/Consultores, apiPath será "Consultores"
    const apiPath = event.path.replace('/.netlify/functions/api/', '');

    const fullNocoDBUrl = `${API_URL}/${apiPath}`;

    try {
        const response = await fetch(fullNocoDBUrl, {
            method: event.httpMethod,
            headers: {
                'Content-Type': 'application/json',
                'xc-token': API_TOKEN,
            },
            body: event.body // Repassa o corpo da requisição original (para POST, PATCH, etc.)
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Falha ao buscar dados do NocoDB.' })
        };
    }
};