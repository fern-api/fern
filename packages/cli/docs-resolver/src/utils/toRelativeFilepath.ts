import { AbsoluteFilePath, RelativeFilePath, relative } from '@fern-api/fs-utils'
import { DocsWorkspace } from '@fern-api/workspace-loader'

export function toRelativeFilepath(docsWorkspace: DocsWorkspace, filepath: AbsoluteFilePath): RelativeFilePath
export function toRelativeFilepath(
    docsWorkspace: DocsWorkspace,
    filepath: AbsoluteFilePath | undefined
): RelativeFilePath | undefined
export function toRelativeFilepath(
    docsWorkspace: DocsWorkspace,
    filepath: AbsoluteFilePath | undefined
): RelativeFilePath | undefined {
    if (filepath == null) {
        return undefined
    }
    return relative(docsWorkspace.absoluteFilePath, filepath)
}
