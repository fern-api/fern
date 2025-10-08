import {
    ExportedFilePath,
    ExportsManager,
    getReferenceToExportFromRoot,
    ImportsManager,
    NamedExport,
    Reference
} from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

export declare namespace BaseClientTypeDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {
        relativePackagePath: string;
        generateIdempotentRequestOptions: boolean;
    }
}

const OPTIONS_INTERFACE_NAME = "BaseClientOptions";
const REQUEST_OPTIONS_INTERFACE_NAME = "BaseRequestOptions";
const IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME = "BaseIdempotentRequestOptions";

export class BaseClientTypeDeclarationReferencer extends AbstractDeclarationReferencer {
    private readonly generateIdempotentRequestOptions: boolean;

    constructor({ generateIdempotentRequestOptions, ...superInit }: BaseClientTypeDeclarationReferencer.Init) {
        super(superInit);
        this.generateIdempotentRequestOptions = generateIdempotentRequestOptions;
    }

    public getExportedFilepath(): ExportedFilePath {
        const namedExports: NamedExport[] = [
            this.getExportedNameOfBaseClientOptions(),
            this.getExportedNameOfBaseRequestOptions()
        ];
        if (this.generateIdempotentRequestOptions) {
            namedExports.push(this.getExportedNameOfBaseIdempotentRequestOptions());
        }
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
        return "BaseClient.ts";
    }

    public getReferenceToBaseClientOptions({
        importsManager,
        exportsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            exportsManager,
            sourceFile,
            exportedName: this.getExportedNameOfBaseClientOptions()
        });
    }

    public getExportedNameOfBaseClientOptions(): NamedExport {
        return {
            name: OPTIONS_INTERFACE_NAME,
            type: "type"
        };
    }

    public getReferenceToBaseRequestOptions({
        importsManager,
        exportsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            exportsManager,
            sourceFile,
            exportedName: this.getExportedNameOfBaseRequestOptions()
        });
    }

    public getExportedNameOfBaseRequestOptions(): NamedExport {
        return { name: REQUEST_OPTIONS_INTERFACE_NAME, type: "type" };
    }

    public getReferenceToBaseIdempotentRequestOptions({
        importsManager,
        exportsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            exportsManager,
            sourceFile,
            exportedName: this.getExportedNameOfBaseIdempotentRequestOptions()
        });
    }

    public getExportedNameOfBaseIdempotentRequestOptions(): NamedExport {
        return {
            name: IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME,
            type: "type"
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
        exportedName: NamedExport;
    }): Reference {
        return getReferenceToExportFromRoot({
            exportedName,
            exportedFromPath: this.getExportedFilepath(),
            exportsManager,
            importsManager,
            referencedIn: sourceFile
        });
    }
}
