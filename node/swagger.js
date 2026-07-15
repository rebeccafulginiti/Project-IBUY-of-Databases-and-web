const swaggerAutogen = require('swagger-autogen')({openapi: '3.0.4' })

const doc = {
    info: {
        title: 'IBUY',
        description: 'Progetto di Basi di Dati e Web (2025-2026) '
    },
    host:`localhost:3000`,
    components: {
        securitySchemes:{
            bearerAuth: {
                type: 'http',
                scheme: 'bearer'
            }
        }
    }
};

const outputFile = './swagger-output.json';
const routes = ['endpoints.js'];
swaggerAutogen(outputFile,routes,doc)