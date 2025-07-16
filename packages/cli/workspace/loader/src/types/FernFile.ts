import { AbsoluteFilePath, RelativeFilePath } from '@fern-api/fs-utils'

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
