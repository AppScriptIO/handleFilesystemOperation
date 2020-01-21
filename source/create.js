const { constants: filesystemConstants, promises: filesystem } = require('fs'),
  path = require('path')

async function recursiveCreateDirectory({ directoryPath }) {
  await filesystem
    .mkdir(directoryPath)
    .then(() => console.log(`\tCreated directory root ${directoryPath}`))
    .catch(error => {
      if (error.code == 'ENOENT' /* doesn't exist */) {
        // means that the parent directory doesn't exist
        let parentDirectory = path.dirname(directoryPath)
        return recursiveCreateDirectory({ directoryPath: parentDirectory }) // create parent directory
          .then(() => recursiveCreateDirectory({ directoryPath: directoryPath })) // retry creation of nested directory
      } else {
        throw error
      }
    })
}

module.exports = {
  recursiveCreateDirectory,
}
