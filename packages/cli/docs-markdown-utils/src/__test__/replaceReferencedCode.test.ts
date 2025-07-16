import { AbsoluteFilePath } from '@fern-api/fs-utils'
import { createMockTaskContext } from '@fern-api/task-context'

import { replaceReferencedCode } from '../replaceReferencedCode'

const absolutePathToFernFolder = AbsoluteFilePath.of('/path/to/fern')
const absolutePathToMarkdownFile = AbsoluteFilePath.of('/path/to/fern/pages/test.mdx')
const context = createMockTaskContext()

describe('replaceReferencedCode', () => {
    it('should replace the referenced code with the content of the code file', async () => {
        const markdown = `
            <Code src="../snippets/test.py" />
            <Code src="../snippets/test.ts" />
        `

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of('/path/to/fern/snippets/test.py')) {
                    return 'test content'
                }
                if (filepath === AbsoluteFilePath.of('/path/to/fern/snippets/test.ts')) {
                    return 'test2 content\nwith multiple lines'
                }
                throw new Error(`Unexpected filepath: ${filepath}`)
            }
        })

        expect(result).toBe(`
            \`\`\`py title={"test.py"}
            test content
            \`\`\`

            \`\`\`ts title={"test.ts"}
            test2 content
            with multiple lines
            \`\`\`

        `)
    })

    it('should preserve maxLines and focus attributes when replacing code references', async () => {
        const markdown = `
            <Code src="../snippets/test.py" maxLines={20} focus={1-18} />
            <Code src="../snippets/test.ts" maxLines="20" focus={1-18} />
        `

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of('/path/to/fern/snippets/test.py')) {
                    return 'test content'
                }
                if (filepath === AbsoluteFilePath.of('/path/to/fern/snippets/test.ts')) {
                    return 'test2 content\nwith multiple lines'
                }
                throw new Error(`Unexpected filepath: ${filepath}`)
            }
        })

        expect(result).toBe(`
            \`\`\`py title={"test.py"} maxLines={20} focus={1-18}
            test content
            \`\`\`

            \`\`\`ts title={"test.ts"} maxLines={20} focus={1-18}
            test2 content
            with multiple lines
            \`\`\`

        `)
    })

    it('should preserve maxLines and focus attributes when they appear before src', async () => {
        const markdown = `
            <Code maxLines={20} focus={1-18} src="../snippets/test.py" />
            <Code maxLines="20" focus={1-18} src="../snippets/test.ts" />
        `

        const result = await replaceReferencedCode({
            markdown,
            absolutePathToFernFolder,
            absolutePathToMarkdownFile,
            context,
            fileLoader: async (filepath) => {
                if (filepath === AbsoluteFilePath.of('/path/to/fern/snippets/test.py')) {
                    return 'test content'
                }
                if (filepath === AbsoluteFilePath.of('/path/to/fern/snippets/test.ts')) {
                    return 'test2 content\nwith multiple lines'
                }
                throw new Error(`Unexpected filepath: ${filepath}`)
            }
        })

        expect(result).toBe(`
            \`\`\`py title={"test.py"} maxLines={20} focus={1-18}
            test content
            \`\`\`

            \`\`\`ts title={"test.ts"} maxLines={20} focus={1-18}
            test2 content
            with multiple lines
            \`\`\`

        `)
    })
})
