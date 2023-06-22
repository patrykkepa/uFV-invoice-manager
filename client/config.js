const winston = require('winston')

module.exports = {
    toolName: 'client',
    logConfiguration: {
        level: 'debug',
        transports: [],
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(info => `${[info.timestamp]} [${info.level}]: ${info.message}`)
        )
    },
    requiredPasswordStrength: 2,
    logToConsole: false,
    panelPort: 8080,
    toolInstance: 'localhost',
    dbUrl: 'mongodb://localhost',
    dbName: 'fv',
    dbOptions: { useUnifiedTopology: true },
    logDir: 'log/fv_client',
    processPrefix: 'fv_client-'
}