const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Picsou documentation',
            version: '1.0.0',
            description: 'Documentation for the Picsou API',
        },
    },
    // Path to the API docs
    apis: ['./apiRouter.js'], // Remplacez par le chemin vers vos fichiers de route
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
