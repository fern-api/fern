import { ExportedFilePath, ImportsManager, Reference, getReferenceToExportFromRoot } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

export declare namespace JsonDeclarationReferencer {
    export interface Init extends AbstractDeclarationReferencer.Init {}
}

export class JsonDeclarationReferencer extends AbstractDeclarationReferencer {
    constructor({ ...superInit }: JsonDeclarationReferencer.Init) {
        super(superInit);
    }

    public getExportedFilepath(): ExportedFilePath {
        return {
            directories: [...this.containingDirectory],
            file: {
                nameOnDisk: this.getFilename(),
                exportDeclaration: {
                    namedExports: ["toJson", "fromJson"]
                }
            }
        };
    }

    public getFilename(): string {
        return "json.ts";
    }

    public getReferenceToFromJson({
        importsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            sourceFile,
            exportedName: "fromJson"
        });
    }

    public getReferenceToToJson({
        importsManager,
        sourceFile
    }: {
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.getReferenceToExport({
            importsManager,
            sourceFile,
            exportedName: "toJson"
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
                file: { nameOnDisk: "json", exportDeclaration: { namedExports: ["toJson", "fromJson"] } }
            },
            exportedName,
            importsManager,
            referencedIn: sourceFile
        });
    }
}
