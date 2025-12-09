import {
    ExportedFilePath,
    ExportsManager,
    getReferenceToExportFromRoot,
    ImportsManager,
    Reference
} from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

import { AbstractDeclarationReferencer } from "./AbstractDeclarationReferencer";

const ERRORS_DIRECTORY = "errors";
const FUNCTION_NAME = "handleNonStatusCodeError";
const FILENAME = "handleNonStatusCodeError.ts";

export class NonStatusCodeErrorHandlerDeclarationReferencer extends AbstractDeclarationReferencer {
    public getFilename(): string {
        return FILENAME;
    }

    public getExportedFilepath(): ExportedFilePath {
        return {
            directories: [
                ...this.containingDirectory,
                {
                    nameOnDisk: ERRORS_DIRECTORY
                }
            ],
            file: {
                nameOnDisk: this.getFilename()
            }
        };
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
        return getReferenceToExportFromRoot({
            exportedName: FUNCTION_NAME,
            exportedFromPath: this.getExportedFilepath(),
            exportsManager,
            importsManager,
            referencedIn: sourceFile
        });
    }
}
