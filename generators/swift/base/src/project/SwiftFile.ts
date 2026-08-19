import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { swift } from "@fern-api/swift-codegen";

export declare namespace SwiftFile {
    interface Args {
        filename: string;
        directory: RelativeFilePath;
        contents: swift.FileComponent[];
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
            contents: [swift.Statement.import("Foundation"), swift.LineBreak.single(), ...args.contents]
        });
    }

    public static getRawContents(components: swift.FileComponent[]) {
        return components.map((component) => component.toString()).join("");
    }

    private constructor(args: SwiftFile.Args) {
        super(args.filename, args.directory, SwiftFile.getRawContents(args.contents));
    }
}
