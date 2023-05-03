const winston = require('winston')

module.exports = {
    toolName: 'panel',
    version: '0.0.1',
    logConfiguration: {
        level: 'debug',
        transports: [],
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(info => `${[info.timestamp]} [${info.level}]: ${info.message}`)
        )
    },
    requiredPasswordStrength: 2
}