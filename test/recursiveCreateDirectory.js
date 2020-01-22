// import assert from 'assert'
import path from 'path'
import { assert } from 'chai'
import filesystem from 'fs'
import deleteModule from 'del'
import { recursiveCreateDirectory } from '../source/create.js'
const testAssetPath = path.join(__dirname, 'asset'),
  testTemporaryFile = path.join(testAssetPath, 'temporary')

describe('function recursiveCreateDirectory:', function() {
  afterEach(function() {
    console.log('Reset - Remove temporary folder.')
    deleteModule.sync([testTemporaryFile])
  })
  describe('Create folder recursively', function() {
    let directoryToCreate = {
      shallowLevel: path.join(testTemporaryFile), // 'temporary'
      deepLevel: path.join(testTemporaryFile, 'x/y/z'), // 'temporary/x/y/z'
    }
    it('Should create single level folder', async function() {
      await recursiveCreateDirectory({ directoryPath: directoryToCreate.shallowLevel })
      assert.isOk(filesystem.existsSync(directoryToCreate.shallowLevel))
    })
    it('Should create multiple level folder', async function() {
      await recursiveCreateDirectory({ directoryPath: directoryToCreate.deepLevel })
      assert.isOk(filesystem.existsSync(directoryToCreate.deepLevel))
    })
  })
})
