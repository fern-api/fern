import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernFilepath } from "@fern-fern/ir-sdk/api";
import path from "path";
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

    public static getFilePathFromFernFilePath(fernFilePath: FernFilepath): RelativeFilePath {
        return RelativeFilePath.of(path.join(...fernFilePath.allParts.map((part) => part.pascalCase.safeName)));
    }
}
