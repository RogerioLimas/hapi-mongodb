const Hapi = require('hapi');
const Joi = require('joi');
const mongoose = require('mongoose');

const server = new Hapi.Server({
    port: 3000,
    host: 'localhost',
});

mongoose.connect('mongodb://localhost/thepolyglotdeveloper', {
    useNewUrlParser: true,
});

const PersonModel = mongoose.model('person', {
    firstName: String,
    lastName: String,
});

server.route({
    method: 'POST',
    path: '/person',
    options: {
        validate: {
            payload: {
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
            },
            failAction: (request, h, error) =>
                error.isJoi
                    ? h.response(error.details[0]).takeover()
                    : h.response(error).takeover(),
        },
    },
    handler: async (request, h) => {
        try {
            const person = new PersonModel(h.request.payload);
            const result = await person.save();
            return h.response(result);
        } catch (error) {
            return h.response(error).code(500);
        }
    },
});

server.route({
    method: 'GET',
    path: '/people',
    handler: async (request, h) => {
        try {
            const people = await PersonModel.find().exec();
            return h.response(people, 200);
        } catch (error) {
            console.log(`Error: ${error}`);
            return h.response(error, 500);
        }
    },
});

server.start();
