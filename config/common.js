const fs = require('fs')

const configDir = '../settings'
const commonConfigFile = 'common.json'

const common = module.exports = {
    loadConfig: (config) => {
        let commonConfig = {}
        let commonConfigFileFull = configDir + '/' + commonConfigFile
        try {
            commonConfig = JSON.parse(fs.readFileSync(commonConfigFileFull), { encoding: 'utf8', flag: 'r' } )
            Object.assign(config, commonConfig)
        } catch(ex) {
            console.error('Cannot read %s file, cannot continue', commonConfigFileFull)
            process.exit(1)
        }
        if(config.toolName) { // specific tool config
            let specificConfigFile = configDir + '/' + config.toolName + '.json'
            try {
                commonConfig = JSON.parse(fs.readFileSync(specificConfigFile), { encoding: 'utf8', flag: 'r' } )
                Object.assign(config, commonConfig)
            } catch(ex) {}
        }
        if(config.logLevel && config.logConfiguration) {
            config.logConfiguration.level = config.logLevel
        }
    }
}