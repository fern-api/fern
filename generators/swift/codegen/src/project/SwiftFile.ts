import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { Enum } from "../ast/Enum";
import { Struct } from "../ast/Struct";

export declare namespace SwiftFile {
    interface Args {
        /* The class to be written to the CSharp File */
        clazz: Struct | Enum;
        /* Directory of the filepath */
        directory: RelativeFilePath;
    }
}

export class SwiftFile extends File {
    constructor({ clazz, directory }: SwiftFile.Args) {
        super(`${clazz.name}.cs`, directory, clazz.toString());
    }
}
