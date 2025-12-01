import { ExportsManager, ImportsManager, Reference } from "@fern-typescript/commons";
import { SourceFile } from "ts-morph";

export interface NonStatusCodeErrorHandlerContext {
    getReferenceToHandleNonStatusCodeError: (args: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }) => Reference;
}
