import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { swift } from "@fern-api/swift-codegen";

export declare namespace SwiftFile {
    interface Args {
        filename: string;
        directory: RelativeFilePath;
        fileContents: string | swift.FileComponent[];
    }
}

export class SwiftFile extends File {
    private static getFileContents(fileContents: string | swift.FileComponent[]) {
        if (typeof fileContents === "string") {
            return fileContents;
        }
        return fileContents.map((component) => component.toString()).join("");
    }

    constructor(args: SwiftFile.Args) {
        super(args.filename, args.directory, SwiftFile.getFileContents(args.fileContents));
    }
}
