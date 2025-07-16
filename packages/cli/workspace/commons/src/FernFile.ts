import { AbsoluteFilePath, RelativeFilePath } from '@fern-api/path-utils'

export interface FernFile {
    relativeFilepath: RelativeFilePath
    absoluteFilepath: AbsoluteFilePath
    fileContents: string
}

export interface ParsedFernFile<Schema> {
    rawContents: string
    contents: Schema
    defaultUrl: string | undefined
}
