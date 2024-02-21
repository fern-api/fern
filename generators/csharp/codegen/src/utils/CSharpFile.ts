import { RelativeFilePath } from "@fern-api/fs-utils";
import { Class } from "../ast";
import { File } from "./File";

export declare namespace CSharpFile {
    interface Args {
        /* The class to be written to the CSharp File */
        clazz: Class;
        /* Directory of the filepath */
        directory: RelativeFilePath;
    }
}

export class CSharpFile extends File {
    constructor({ clazz, directory }: CSharpFile.Args) {
        super(`${clazz.name}.cs`, directory, clazz.toString());
    }
}
