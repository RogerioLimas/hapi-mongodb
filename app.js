const Hapi = require('hapi');
const Joi = require('joi');
const mongoose = require('mongoose');

const { env } = process;

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const server = new Hapi.Server({
    port: env.SERVER_PORT,
    host: env.SERVER_HOST,
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

server.route({
    method: 'GET',
    path: '/person/{id}',
    handler: async (request, h) => {
        try {
            const person = await PersonModel.findById(request.params.id).exec();
            return h.response(person);
        } catch (error) {
            return h.response(error, 500);
        }
    },
});

server.route({
    method: 'PUT',
    path: '/person/{id}',
    options: {
        validate: {
            payload: {
                firstName: Joi.string().optional(),
                lastName: Joi.string().optional(),
            },
            failAction: (request, h, error) =>
                error.isJoi
                    ? h.response(error.details[0]).takeover()
                    : h.response(error).takeover(),
        },
    },
    handler: async (request, h) => {
        try {
            const retorno = await PersonModel.findByIdAndUpdate(
                request.params.id,
                request.payload,
                { new: true }
            ).exec();
            return h.response(retorno);
        } catch (error) {
            console.log(error);
            return h.response(error, 500);
        }
    },
});

server.route({
    method: 'DELETE',
    path: '/person/{id}',
    handler: async (request, h) => {
        try {
            const deletedPerson = await PersonModel.findByIdAndDelete(
                request.params.id
            ).exec();
            return h.response(deletedPerson, 200);
        } catch (error) {
            return h.response(error, 500);
        }
    },
});

server
    .start()
    .then(() => console.log(
            `Server listening on http://${env.SERVER_HOST}:${env.SERVER_PORT}`,
        ));
