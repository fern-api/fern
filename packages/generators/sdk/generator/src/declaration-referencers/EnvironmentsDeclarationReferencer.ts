import { EnvironmentsConfig } from "@fern-fern/ir-model/environment";
import {
    ExportedFilePath,
    getReferenceToExportViaNamespaceImport,
    ImportsManager,
    Reference,
} from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";
import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

export declare namespace EnvironmentsDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {
        environmentsConfig: EnvironmentsConfig | undefined;
    }
}

export class EnvironmentsDeclarationReferencer extends AbstractDeclarationReferencer {
    private environmentsConfig: EnvironmentsConfig | undefined;

    constructor({ environmentsConfig, ...superInit }: EnvironmentsDeclarationReferencer.Init) {
        super(superInit);
        this.environmentsConfig = environmentsConfig;
    }

    public getExportedFilepath(): ExportedFilePath {
        const namedExports = [this.getExportedNameOfEnvironmentsEnum()];
        if (this.environmentsConfig?.environments.type === "multipleBaseUrls") {
            namedExports.push(this.getExportedNameOfEnvironmentUrls());
        }

        return {
            directories: [...this.containingDirectory],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: {
                    namedExports,
                },
            },
        };
    }

    public getFilename(): string {
        return "environments.ts";
    }

    public getExportedNameOfEnvironmentsEnum(): string {
        return `${this.namespaceExport}Environment`;
    }

    public getExportedNameOfEnvironmentUrls(): string {
        return `${this.namespaceExport}EnvironmentUrls`;
    }

    public getReferenceToEnvironmentsEnum({
        importsManager,
        sourceFile,
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            sourceFile,
            exportedName: this.getExportedNameOfEnvironmentsEnum(),
        });
    }

    public getReferenceToEnvironmentUrls({
        importsManager,
        sourceFile,
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            sourceFile,
            exportedName: this.getExportedNameOfEnvironmentUrls(),
        });
    }

    private getReferenceToExport({
        importsManager,
        sourceFile,
        exportedName,
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
        exportedName: string;
    }): Reference {
        return getReferenceToExportViaNamespaceImport({
            exportedName,
            filepathToNamespaceImport: this.getExportedFilepath(),
            filepathInsideNamespaceImport: undefined,
            namespaceImport: "environments",
            importsManager,
            referencedIn: sourceFile,
        });
    }
}
