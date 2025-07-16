import { File } from '@fern-api/base-generator'
import { RelativeFilePath } from '@fern-api/fs-utils'

export declare namespace SwiftFile {
    interface Args {
        filename: string
        directory: RelativeFilePath
        fileContents: string
    }
}

export class SwiftFile extends File {
    constructor(args: SwiftFile.Args) {
        super(args.filename, args.directory, args.fileContents)
    }
}
