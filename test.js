const Hapi = require('hapi');
require('dotenv').config();

const { env } = process;

const server = new Hapi.Server({
    host: env.SERVER_HOST,
    port: env.SERVER_PORT,
});

server.route({
    method: 'GET',
    path: '/',
    handler: async (request, h) => h.response('<h1>Página inicial!</h1>', 200),
});

server.route({
    method: 'GET',
    path: '/{id}',
    handler: async (request, h) => h.response(request.params.id),
});

server.start().then(() => {
    console.log(`Server running on http://${env.SERVER_HOST}:${env.SERVER_PORT}`);
});
