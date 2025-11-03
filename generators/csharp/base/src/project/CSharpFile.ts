import { File } from "@fern-api/base-generator";
import { ast, Generation } from "@fern-api/csharp-codegen";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { FernFilepath } from "@fern-fern/ir-sdk/api";
import path from "path";

export type Namespace = string;

export declare namespace CSharpFile {
    interface Args {
        /* The class to be written to the CSharp File */
        clazz: ast.Class | ast.Enum | ast.Interface;
        /* Directory of the filepath */
        directory: RelativeFilePath;
        /* All base namespaces. Can be pulled directly from context. */
        allNamespaceSegments: Set<string>;
        /* The name of every type in the project mapped to the namespaces a type of that name belongs to */
        allTypeClassReferences: Map<string, Set<Namespace>>;
        /* The root namespace of the project. Can be pulled directly from context. */
        namespace: string;
        /* Custom generator config */
        generation: Generation;
        /* The header to be written to the file */
        fileHeader?: string;
    }
}

export class CSharpFile extends File {
    constructor({
        clazz,
        directory,
        allNamespaceSegments,
        allTypeClassReferences,
        generation,
        fileHeader
    }: CSharpFile.Args) {
        let fileContents = clazz.toString({
            namespace: clazz.namespace,
            allNamespaceSegments,
            allTypeClassReferences,
            generation
        });
        if (fileHeader) {
            fileContents = `${fileHeader}\n\n${fileContents}`;
        }

        super(`${clazz.name}.cs`, directory, fileContents);
    }

    public async tryWrite(directoryPrefix: AbsoluteFilePath): Promise<void> {
        await this.write(directoryPrefix);
    }

    public static getFilePathFromFernFilePath(fernFilePath: FernFilepath): RelativeFilePath {
        return RelativeFilePath.of(path.join(...fernFilePath.allParts.map((part) => part.pascalCase.safeName)));
    }
}
