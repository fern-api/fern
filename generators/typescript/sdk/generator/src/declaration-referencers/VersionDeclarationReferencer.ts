import {
    ExportedFilePath,
    ImportsManager,
    Reference,
    getReferenceToExportViaNamespaceImport
} from "@fern-typescript/commons";
import { SourceFile, ts } from "ts-morph";

import { ApiVersionScheme } from "@fern-fern/ir-sdk/api";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

export declare namespace VersionDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {
        apiVersion: ApiVersionScheme | undefined;
    }
}

export class VersionDeclarationReferencer extends AbstractDeclarationReferencer {
    private apiVersion: ApiVersionScheme | undefined;

    constructor({ apiVersion, ...superInit }: VersionDeclarationReferencer.Init) {
        super(superInit);
        this.apiVersion = apiVersion;
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
        sourceFile
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }): Reference | undefined {
        if (this.apiVersion == null) {
            return undefined;
        }
        return this.getReferenceToExport({
            importsManager,
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
        sourceFile,
        exportedName
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
        exportedName: string;
    }): Reference {
        return getReferenceToExportViaNamespaceImport({
            exportedName,
            filepathToNamespaceImport: this.getExportedFilepath(),
            filepathInsideNamespaceImport: undefined,
            namespaceImport: "version",
            importsManager,
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
