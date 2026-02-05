import { ExportsManager, ImportsManager, Reference } from "@fern-typescript/commons";
import { NonStatusCodeErrorHandlerContext } from "@fern-typescript/contexts";
import { SourceFile } from "ts-morph";

import { NonStatusCodeErrorHandlerDeclarationReferencer } from "../../declaration-referencers/NonStatusCodeErrorHandlerDeclarationReferencer";
import { NonStatusCodeErrorHandlerGenerator } from "../../non-status-code-error-handler/NonStatusCodeErrorHandlerGenerator";

export declare namespace NonStatusCodeErrorHandlerContextImpl {
    export interface Init {
        nonStatusCodeErrorHandlerDeclarationReferencer: NonStatusCodeErrorHandlerDeclarationReferencer;
        nonStatusCodeErrorHandlerGenerator: NonStatusCodeErrorHandlerGenerator;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }
}

export class NonStatusCodeErrorHandlerContextImpl implements NonStatusCodeErrorHandlerContext {
    private nonStatusCodeErrorHandlerDeclarationReferencer: NonStatusCodeErrorHandlerDeclarationReferencer;
    private nonStatusCodeErrorHandlerGenerator: NonStatusCodeErrorHandlerGenerator;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private sourceFile: SourceFile;

    constructor({
        nonStatusCodeErrorHandlerDeclarationReferencer,
        nonStatusCodeErrorHandlerGenerator,
        importsManager,
        exportsManager,
        sourceFile
    }: NonStatusCodeErrorHandlerContextImpl.Init) {
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.sourceFile = sourceFile;
        this.nonStatusCodeErrorHandlerDeclarationReferencer = nonStatusCodeErrorHandlerDeclarationReferencer;
        this.nonStatusCodeErrorHandlerGenerator = nonStatusCodeErrorHandlerGenerator;
    }

    public getReferenceToHandleNonStatusCodeError(args: {
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }): Reference {
        return this.nonStatusCodeErrorHandlerDeclarationReferencer.getReferenceToHandleNonStatusCodeError(args);
    }

    public getGeneratedNonStatusCodeErrorHandler() {
        return this.nonStatusCodeErrorHandlerGenerator.generateNonStatusCodeErrorHandler();
    }
}
