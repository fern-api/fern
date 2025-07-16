import { AbsoluteFilePath } from './AbsoluteFilePath'
import { RelativeFilePath } from './RelativeFilePath'

// For convenience, we re-export the convertToOsPath type for any caller
// that requires fs-utils.
export { convertToOsPath } from '@fern-api/path-utils'

export function convertToFernHostAbsoluteFilePath(path: AbsoluteFilePath): AbsoluteFilePath {
    // Don't use 'of' here, as it will use OS path, we want fern path
    return convertToFernHostPath(path) as AbsoluteFilePath
}
export function convertToFernHostRelativeFilePath(path: RelativeFilePath): RelativeFilePath {
    // Don't use 'of' here, as it will use OS path, we want fern path
    return convertToFernHostPath(path) as RelativeFilePath
}

function convertToFernHostPath(path: string): string {
    let unixPath = path
    if (/^[a-zA-Z]:\\/.test(path)) {
        unixPath = path.substring(2)
    }

    return unixPath.replace(/\\/g, '/')
}
