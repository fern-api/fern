import { ExportedFilePath, ImportsManager, Reference, getReferenceToExportFromRoot } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

export declare namespace RawResponseDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {}
}

const namedExports = ["RawResponse", "toRawResponse", "WithRawResponse"];
export class RawResponseDeclarationReferencer extends AbstractDeclarationReferencer {
    constructor({ ...superInit }: RawResponseDeclarationReferencer.Init) {
        super(superInit);
    }

    public getExportedFilepath(): ExportedFilePath {
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
        return "RawResponse.ts";
    }

    public getReferenceToRawResponse({
        importsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            sourceFile,
            exportedName: "RawResponse"
        });
    }

    public getReferenceToToRawResponse({
        importsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            sourceFile,
            exportedName: "toRawResponse"
        });
    }

    public getReferenceToWithRawResponse({
        importsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            sourceFile,
            exportedName: "WithRawResponse"
        });
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
        return getReferenceToExportFromRoot({
            exportedFromPath: {
                directories: [{ nameOnDisk: "core" }],
                file: {
                    nameOnDisk: "RawResponse",
                    exportDeclaration: { namedExports }
                }
            },
            exportedName,
            importsManager,
            referencedIn: sourceFile
        });
    }
}
