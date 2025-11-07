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
const HANDLE_GLOBAL_STATUS_CODE_ERROR_FUNCTION_NAME = "handleGlobalStatusCodeError";
const HANDLE_NON_STATUS_CODE_ERROR_FUNCTION_NAME = "handleNonStatusCodeError";

export class BaseClientTypeDeclarationReferencer extends AbstractDeclarationReferencer {
    private readonly generateIdempotentRequestOptions: boolean;

    constructor({ generateIdempotentRequestOptions, ...superInit }: BaseClientTypeDeclarationReferencer.Init) {
        super(superInit);
        this.generateIdempotentRequestOptions = generateIdempotentRequestOptions;
    }

    public getExportedFilepath(): ExportedFilePath {
        const namedExports: NamedExport[] = [
            this.getExportedNameOfBaseClientOptions(),
            this.getExportedNameOfBaseRequestOptions(),
            this.getExportedNameOfHandleGlobalStatusCodeError(),
            this.getExportedNameOfHandleNonStatusCodeError()
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

    public getReferenceToHandleGlobalStatusCodeError({
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
            exportedName: this.getExportedNameOfHandleGlobalStatusCodeError()
        });
    }

    public getExportedNameOfHandleGlobalStatusCodeError(): NamedExport {
        return { name: HANDLE_GLOBAL_STATUS_CODE_ERROR_FUNCTION_NAME };
    }

    public getReferenceToHandleNonStatusCodeError({
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
            exportedName: this.getExportedNameOfHandleNonStatusCodeError()
        });
    }

    public getExportedNameOfHandleNonStatusCodeError(): NamedExport {
        return { name: HANDLE_NON_STATUS_CODE_ERROR_FUNCTION_NAME };
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
