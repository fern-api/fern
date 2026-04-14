import { CaseConverter, File } from "@fern-api/base-generator";
import { ast, Generation } from "@fern-api/csharp-codegen";
import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { FernIr } from "@fern-fern/ir-sdk";

type FernFilepath = FernIr.FernFilepath;

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
    private _clazz: ast.Class | ast.Enum | ast.Interface;
    private allNamespaceSegments: Set<string>;
    private allTypeClassReferences: Map<string, Set<Namespace>>;
    private generation: Generation;
    private fileHeader: string | undefined;
    private resolved: boolean = false;

    constructor({
        clazz,
        directory,
        allNamespaceSegments,
        allTypeClassReferences,
        generation,
        fileHeader
    }: CSharpFile.Args) {
        super(`${clazz.name}.cs`, directory, "");
        this._clazz = clazz;
        this.allNamespaceSegments = allNamespaceSegments;
        this.allTypeClassReferences = allTypeClassReferences;
        this.generation = generation;
        this.fileHeader = fileHeader;
    }

    /**
     * Lazily resolves the AST to string, caching the result for subsequent calls.
     */
    private resolveFileContents(): void {
        if (this.resolved) {
            return;
        }
        let fileContents = this._clazz.toString({
            namespace: this._clazz.namespace,
            allNamespaceSegments: this.allNamespaceSegments,
            allTypeClassReferences: this.allTypeClassReferences,
            generation: this.generation
        });
        if (this.fileHeader) {
            fileContents = `${this.fileHeader}\n\n${fileContents}`;
        }
        this.fileContents = fileContents;
        this.resolved = true;
    }

    public override async write(directoryPrefix: AbsoluteFilePath): Promise<void> {
        this.resolveFileContents();
        await super.write(directoryPrefix);
    }

    public async tryWrite(directoryPrefix: AbsoluteFilePath): Promise<void> {
        await this.write(directoryPrefix);
    }

    /** Returns the underlying AST class/enum/interface node. */
    public get clazz(): ast.Class | ast.Enum | ast.Interface {
        return this._clazz;
    }

    public static getFilePathFromFernFilePath(
        fernFilePath: FernFilepath,
        caseConverter: CaseConverter
    ): RelativeFilePath {
        return RelativeFilePath.of(path.join(...fernFilePath.allParts.map((part) => caseConverter.pascalSafe(part))));
    }
}
