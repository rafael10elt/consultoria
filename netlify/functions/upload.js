const axios = require('axios');
const FormData = require('form-data');

exports.handler = async function(event, context) {
    // 1. Configurações de CORS e segurança
    const headers = {
        'Access-Control-Allow-Origin': '*', // Ou seu domínio específico para mais segurança
        'Access-Control-Allow-Headers': 'Content-Type, xc-token',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    // Responde a requisições OPTIONS (pre-flight)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers,
            body: ''
        };
    }

    // 2. Verifica se o método é POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 3. Obtém os dados e o token do frontend
        const body = JSON.parse(event.body);
        const { file: base64File, fileName, path } = body;
        const apiToken = event.headers['xc-token'];

        if (!base64File || !path || !apiToken) {
            return { statusCode: 400, body: 'Dados insuficientes na requisição.' };
        }

        // 4. Converte a string base64 de volta para um buffer binário
        const fileBuffer = Buffer.from(base64File, 'base64');
        
        // 5. Cria o payload no formato multipart/form-data
        const form = new FormData();
        form.append('file', fileBuffer, fileName); // O NocoDB espera o campo 'file'
        
        // 6. Monta a URL final da API do NocoDB
        const nocoDbUrl = `${process.env.NOCODB_URL}/api/v1/db/storage/upload?path=${encodeURIComponent(path)}`;

        // 7. Envia a requisição para o NocoDB
        const response = await axios.post(nocoDbUrl, form, {
            headers: {
                ...form.getHeaders(), // Headers essenciais para multipart/form-data
                'xc-token': apiToken
            }
        });

        // 8. Retorna a resposta do NocoDB para o frontend
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response.data)
        };

    } catch (error) {
        console.error('ERRO NA FUNÇÃO DE UPLOAD:', error.response ? error.response.data : error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: "Erro interno no servidor ao processar o upload.", error: error.message })
        };
    }
};