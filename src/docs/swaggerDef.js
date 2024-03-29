const { version } = require('../../package.json');
const config = require('../config/config');

const swaggerDef = {
  openapi: '3.0.0',
  info: {
    title: 'mail-listener API documentation',
    version,
    license: {
      name: 'MIT',
      url: 'https://github.com/hamzezn/mail-listener/blob/master/LICENSE',
    },
  },
  servers: [
    {
      url: `${config.swagger.scheme}://${config.domain}:${config.swagger.port}/v1`,
    },
  ],
  components: {
    parameters: {
      ExampleParam: {
        name: 'exampleParam',
        in: 'query',
        description: 'Description with a dynamic link {@link <%= exampleLink %>}.',
        required: true,
        schema: {
          type: 'string',
        },
      },
    },
  },
};

module.exports = swaggerDef;
