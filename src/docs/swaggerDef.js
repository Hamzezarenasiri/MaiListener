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
      url: `${config.domainScheme}://${config.domain}:${config.port}/v1`,
    },
  ],
};

module.exports = swaggerDef;
