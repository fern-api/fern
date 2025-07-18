import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";

export declare namespace RustFile {
    interface Args {
        filename: string;
        directory: RelativeFilePath;
        fileContents: string;
    }
}

export class RustFile extends File {
    constructor(args: RustFile.Args) {
        super(args.filename, args.directory, args.fileContents);
    }
}
