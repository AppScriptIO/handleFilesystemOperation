const filesystem = require('fs')

// copy file and preserve target path in case exists
export function copyFile(targetArray) {
  for (const target of targetArray) {
    // keep original file
    if (filesystem.existsSync(target.destination)) {
      let originalPath = `${target.destination}.original`
      if (!filesystem.existsSync(originalPath)) filesystem.renameSync(target.destination, originalPath)
    }

    try {
      filesystem.copyFileSync(target.source, target.destination)
      console.log(`• Copied ✔  ${target.source} --> ${target.destination}`)
    } catch (error) {
      throw error
    }
  }
}
