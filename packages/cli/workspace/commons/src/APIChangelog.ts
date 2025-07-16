import { AbsoluteFilePath } from '@fern-api/path-utils'

export interface APIChangelog {
    files: ChangelogFile[]
}

export interface ChangelogFile {
    absoluteFilepath: AbsoluteFilePath
    contents: string
}
