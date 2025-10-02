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

    constructor({
        generateIdempotentRequestOptions,
        ...superInit
    }: BaseClientTypeDeclarationReferencer.Init) {
        super(superInit);
        this.generateIdempotentRequestOptions = generateIdempotentRequestOptions;
    }

    public getExportedFilepath(): ExportedFilePath {
        const namedExports: NamedExport[] = [
                        {
                            name: OPTIONS_INTERFACE_NAME,
                            type: "type"
                        },
                        {
                            name: REQUEST_OPTIONS_INTERFACE_NAME,
                            type: "type"
                        }
                    ];
        if(this.generateIdempotentRequestOptions){
            namedExports.push({
                name: IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME,
                type: "type"
            });
        }
        return {
            directories: [...this.containingDirectory],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: {
                    namedExports,
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

    public getExportedNameOfBaseClientOptions(): string {
        return OPTIONS_INTERFACE_NAME;
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
    
    public getExportedNameOfBaseRequestOptions(): string {
        return REQUEST_OPTIONS_INTERFACE_NAME;
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
            exportedName: this.getExportedNameOfBaseRequestOptions()
        });
    }
    
    public getExportedNameOfBaseIdempotentRequestOptions(): string {
        return IDEMPOTENT_REQUEST_OPTIONS_INTERFACE_NAME;
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
        return getReferenceToExportFromRoot({
            exportedName,
            exportedFromPath: this.getExportedFilepath(),
            exportsManager,
            importsManager,
            referencedIn: sourceFile,
        });
    }
}
