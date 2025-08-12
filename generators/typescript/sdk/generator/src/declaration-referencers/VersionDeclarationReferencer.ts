import { ApiVersionScheme } from "@fern-fern/ir-sdk/api";
import {
    ExportedDirectory,
    ExportedFilePath,
    ExportsManager,
    getReferenceToExportViaNamespaceImport,
    ImportsManager,
    Reference
} from "@fern-typescript/commons";
import { SourceFile, ts } from "ts-morph";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

export declare namespace VersionDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {
        apiVersion: ApiVersionScheme | undefined;
        relativePackagePath: string;
        relativeTestPath: string;
    }
}

export class VersionDeclarationReferencer extends AbstractDeclarationReferencer {
    private apiVersion: ApiVersionScheme | undefined;
    private readonly relativePackagePath: string;
    private readonly relativeTestPath: string;

    constructor({
        apiVersion,
        relativePackagePath,
        relativeTestPath,
        ...superInit
    }: VersionDeclarationReferencer.Init) {
        super(superInit);
        this.apiVersion = apiVersion;
        this.relativePackagePath = relativePackagePath;
        this.relativeTestPath = relativeTestPath;
    }

    public getExportedFilepath(): ExportedFilePath {
        const namedExports = [this.getExportedNameOfVersionEnum()];
        return {
            directories: [...this.containingDirectory],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: {
                    namedExports
                }
            }
        };
    }

    public getFilename(): string {
        return "version.ts";
    }

    public getExportedNameOfVersionEnum(): string {
        return `${this.namespaceExport}Version`;
    }

    public getExportedNameOfFirstVersionEnum(): string | undefined {
        if (this.apiVersion == null) {
            return undefined;
        }
        return this.getFirstVersionName(this.apiVersion);
    }

    public getReferenceToVersionEnum({
        importsManager,
        exportsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }): Reference | undefined {
        if (this.apiVersion == null) {
            return undefined;
        }
        return this.getReferenceToExport({
            importsManager,
            exportsManager,
            sourceFile,
            exportedName: this.getExportedNameOfVersionEnum()
        });
    }

    public getReferenceToFirstVersionEnum(): Reference | undefined {
        const firstVersionEnum = this.getExportedNameOfFirstVersionEnum();
        if (firstVersionEnum == null) {
            return undefined;
        }
        return {
            getExpression: () => ts.factory.createIdentifier(firstVersionEnum),
            getTypeNode: () => ts.factory.createTypeReferenceNode(firstVersionEnum),
            getEntityName: () => ts.factory.createIdentifier(firstVersionEnum)
        };
    }

    private getReferenceToExport({
        importsManager,
        exportsManager,
        sourceFile,
        exportedName
    }: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
        exportedName: string;
    }): Reference {
        return getReferenceToExportViaNamespaceImport({
            exportedName,
            filepathToNamespaceImport: this.getExportedFilepath(),
            filepathInsideNamespaceImport: undefined,
            namespaceImport: "version",
            importsManager,
            exportsManager,
            referencedIn: sourceFile
        });
    }

    private getFirstVersionName(apiVersion: ApiVersionScheme): string {
        switch (apiVersion.type) {
            case "header":
                return apiVersion.value.values[0]?.name.wireValue ?? "1.0.0";
        }
    }
}
