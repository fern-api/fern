import {
    ExportedFilePath,
    ExportsManager,
    ImportsManager,
    Reference,
    getReferenceToExportFromRoot
} from "@fern-typescript/commons";
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
            exportedName: "fromJson"
        });
    }

    public getReferenceToToJson({
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
            exportedName: "toJson"
        });
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
            exportedFromPath: {
                directories: [{ nameOnDisk: "core" }],
                file: { nameOnDisk: "json", exportDeclaration: { namedExports: ["toJson", "fromJson"] } }
            },
            exportedName,
            importsManager,
            exportsManager,
            referencedIn: sourceFile
        });
    }
}
