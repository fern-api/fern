import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { swift } from "@fern-api/swift-codegen";

export declare namespace SwiftFile {
    interface Args {
        filename: string;
        directory: RelativeFilePath;
        fileContents: swift.FileComponent[];
    }
}

export class SwiftFile extends File {
    public static create(args: SwiftFile.Args) {
        return new SwiftFile(args);
    }

    /**
     * Creates a new Swift file with the Foundation framework imported.
     */
    public static createWithFoundation(args: SwiftFile.Args) {
        return new SwiftFile({
            ...args,
            fileContents: [swift.Statement.import("Foundation"), swift.LineBreak.single(), ...args.fileContents]
        });
    }

    private static getRawContents(fileContents: swift.FileComponent[]) {
        return fileContents.map((component) => component.toString()).join("");
    }

    private constructor(args: SwiftFile.Args) {
        super(args.filename, args.directory, SwiftFile.getRawContents(args.fileContents));
    }
}
