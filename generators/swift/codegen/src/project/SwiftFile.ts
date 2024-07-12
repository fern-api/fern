import { GeneratedFile } from "@fern-api/generator-commons";
import { File } from "../ast/File";

export declare namespace SwiftFile {
    interface Args {
        name: string;
        file: File;
        directory: string;
    }
}

export class SwiftFile extends GeneratedFile {
    constructor({ name, file, directory }: SwiftFile.Args) {
        super(name, "swift", directory, file);
    }
}
