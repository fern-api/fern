import { readFile, rm } from 'fs/promises'
import path from 'path'

import { AbsoluteFilePath, doesPathExist } from '@fern-api/fs-utils'

import { runFernCli } from '../../utils/runFernCli'

const FIXTURES_DIR = path.join(__dirname, 'fixtures')

describe('write-docs-definition', () => {
    it.skip('petstore', () => testFixture('petstore'), 10_000)
    it.skip('products-with-versions', () => testFixture('products-with-versions'), 10_000)
})

async function testFixture(fixtureName: string) {
    const fixturePath = path.join(FIXTURES_DIR, fixtureName)
    const outputPath = path.join(fixturePath, 'docs-definition.json')

    // Clean up existing output
    if (await doesPathExist(AbsoluteFilePath.of(outputPath))) {
        await rm(outputPath, { force: true })
    }

    // Generate docs definition
    await runFernCli(['write-docs-definition', 'docs-definition.json', '--log-level', 'debug'], {
        cwd: fixturePath
    })

    // Read and verify output
    const contents = await readFile(AbsoluteFilePath.of(outputPath), 'utf-8')
    const parsed = JSON.parse(contents)

    // Remove IDs for snapshot comparison
    const cleanOutput = JSON.parse(
        JSON.stringify(parsed, (key, value) => {
            return key === 'apiDefinitionId' || key === 'id' ? undefined : value
        })
    )
    // biome-ignore lint/suspicious/noMisplacedAssertion: allow
    expect(cleanOutput).toMatchSnapshot()
}
