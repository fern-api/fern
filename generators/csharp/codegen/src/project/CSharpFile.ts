import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { FernFilepath } from "@fern-fern/ir-sdk/api";
import path from "path";
import { Class, Enum } from "../ast";
import { File } from "./File";

export declare namespace CSharpFile {
    interface Args {
        /* The class to be written to the CSharp File */
        clazz: Class | Enum;
        /* Directory of the filepath */
        directory: RelativeFilePath;
        /* All base namespaces. Can be pulled directly from context. */
        allBaseNamespaces: Set<string>;
        /* The root namespace of the project. Can be pulled directly from context. */
        namespace: string;
    }
}

export class CSharpFile extends File {
    constructor({ clazz, directory, allBaseNamespaces, namespace }: CSharpFile.Args) {
        super(`${clazz.name}.cs`, directory, clazz.toString(clazz.getNamespace(), allBaseNamespaces, namespace));
    }

    public async tryWrite(directoryPrefix: AbsoluteFilePath): Promise<void> {
        await this.write(directoryPrefix);
    }

    public static getFilePathFromFernFilePath(fernFilePath: FernFilepath): RelativeFilePath {
        return RelativeFilePath.of(path.join(...fernFilePath.allParts.map((part) => part.pascalCase.safeName)));
    }
}
