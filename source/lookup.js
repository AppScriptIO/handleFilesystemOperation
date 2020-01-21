import filesystem from 'fs'
import path from 'path'
import assert from 'assert'

/** get direcotry contents list 
 @return array of files that exist in a directory. 
 */
export const listContent = ({
  dir, // single path or array of directory paths.
  filelist = [],
  option,
} = {}) => {
  if (!Array.isArray(dir)) dir = [dir] // in case a single string, convert it to array to work with the function.

  for (let directoryPath of dir) {
    filelist = filelist.concat(listContentSingleContent({ directoryPath, option }))
  }

  return filelist
}

export function listContentSingleContent({
  directoryPath,
  filelist = [],
  option = {
    recursive: false,
  },
}) {
  if (!filesystem.existsSync(directoryPath)) return filelist
  filesystem.readdirSync(directoryPath).forEach(content => {
    if (option.recursive) {
      filelist = filesystem.statSync(path.join(directoryPath, content)).isDirectory() ? listContent(path.join(directoryPath, content), filelist) : filelist.push(content)
    } else {
      filelist.push(content)
    }
  })
  return filelist
}

// returns all files in nested directory.
export function listFileRecursively({ directory, ignoreRegex = [new RegExp(/node_modules/), new RegExp(/.git/)] }) {
  let results = []
  let list = filesystem.readdirSync(directory)
  list.forEach(filename => {
    let filepath = path.join(directory, filename)
    // check if the path should be ignored
    let shouldIgnore = ignoreRegex.some(regex => {
      return filepath.match(regex)
    })
    if (shouldIgnore) return
    let stat
    try {
      stat = filesystem.statSync(filepath)
    } catch (error) {
      return // skip iteration on failed seaches.
    }
    if (stat && stat.isDirectory()) results = results.concat(listFileRecursively({ directory: filepath }))
    else results.push({ name: filename, path: filepath }) // create object
  })
  return results
}

// interface for listFieRecusively function that returns an array of file paths, and filters files with the specified extension.
export function listFileWithExtension({ directory, extension = [], ignoreRegex = [] }) {
  if (!Array.isArray(extension)) extension = [extension] // support array or string
  return listFileRecursively({ directory })
    .filter(file => {
      let c1 = extension.some(suffix => file.name.substr(-suffix.length) === suffix) // Only keep the files with the extension
      let c2 = ignoreRegex.some(regex => file.path.match(regex)) // filter files matching ignore regex
      return c1 && !c2
    })
    .reduce((accumulator, currentValue) => {
      accumulator.push(currentValue.path)
      return accumulator
    }, [])
}

/** Resolve test file paths from a list of direcotyr and file paths */
export function resolveAndLookupFile({
  pathArray /** relative or absolute paths */,
  basePath /** the base path for relative paths */,
  fileExtension,
  ignoreRegex = [path.join(basePath, 'temporary'), path.join(basePath, 'distribution')] /*can contain regex or paths*/,
}) {
  pathArray = [...new Set(pathArray)] // remove duplicate enteries.

  // ignore temporary transpilation files to prevent watch event emission loop when inspector debugging and auto attach for debugger.
  // TODO: Read .ignore files and ignore them in the watch list to prevent change callback triggering.
  ignoreRegex = ignoreRegex
    // TODO: verify regex not ignoring files it supposed to keep and ignoring others.
    .filter(ignore => !pathArray.some(inputPath => inputPath.includes(ignore))) // prevent igonring files provided as input that are supposed to be added and lookedup
    .map(item => (item instanceof RegExp ? item : new RegExp(`${item}`))) // create regex from paths

  /* List all files in a directory recursively */
  console.log(`• Searching for ${JSON.stringify(fileExtension)} extension files, in path ${JSON.stringify(pathArray)}.`)
  let fileArray = []
  pathArray.forEach(currentPath => {
    currentPath = !path.isAbsolute(currentPath) ? path.join(basePath, currentPath) : currentPath // resolve to absolute path
    console.log(`• Test path: ${currentPath}`)
    if (fileExtension.some(extension => currentPath.endsWith(extension))) {
      // file path
      fileArray.push(currentPath)
    } else {
      // directory path
      let fileList = listFileWithExtension({ directory: currentPath, extension: fileExtension, ignoreRegex })
      fileArray = [...fileArray, ...fileList]
    }
  })

  fileArray = [...new Set(fileArray)] // remove duplicate enteries.
  return fileArray
}
