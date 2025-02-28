import path from "path";

import { File } from "@fern-api/base-generator";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";

import { FernFilepath } from "@fern-fern/ir-sdk/api";

import { Class, Enum, Interface } from "../ast";
import { BaseCsharpCustomConfigSchema } from "../custom-config";

export type Namespace = string;

export declare namespace CSharpFile {
    interface Args {
        /* The class to be written to the CSharp File */
        clazz: Class | Enum | Interface;
        /* Directory of the filepath */
        directory: RelativeFilePath;
        /* All base namespaces. Can be pulled directly from context. */
        allNamespaceSegments: Set<string>;
        /* The name of every type in the project mapped to the namespaces a type of that name belongs to */
        allTypeClassReferences: Map<string, Set<Namespace>>;
        /* The root namespace of the project. Can be pulled directly from context. */
        namespace: string;
        /* Custom generator config */
        customConfig: BaseCsharpCustomConfigSchema;
    }
}

export class CSharpFile extends File {
    constructor({
        clazz,
        directory,
        allNamespaceSegments,
        allTypeClassReferences,
        namespace,
        customConfig
    }: CSharpFile.Args) {
        super(
            `${clazz.name}.cs`,
            directory,
            clazz.toString({
                namespace: clazz.getNamespace(),
                allNamespaceSegments,
                allTypeClassReferences,
                rootNamespace: namespace,
                customConfig
            })
        );
    }

    public async tryWrite(directoryPrefix: AbsoluteFilePath): Promise<void> {
        await this.write(directoryPrefix);
    }

    public static getFilePathFromFernFilePath(fernFilePath: FernFilepath): RelativeFilePath {
        return RelativeFilePath.of(path.join(...fernFilePath.allParts.map((part) => part.pascalCase.safeName)));
    }
}
