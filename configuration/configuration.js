const path = require('path')
const deploymentScriptPath = path.dirname( require.resolve(`@dependency/deploymentScript/package.json`) ) 

module.exports = {
    directory: {
        application: {
            rootPath: path.normalize(`${__dirname}/..`),
        }
    },
    script: [
        {
            type: 'directory',
            path: './script/' // relative to applicaiton repository root.
        },
        {
            key: 'test',
            path: `${deploymentScriptPath}/script/test`,
        },
        {
            key: 'sleep',
            path: `${deploymentScriptPath}/script/sleep`,
        }
    ],
}
