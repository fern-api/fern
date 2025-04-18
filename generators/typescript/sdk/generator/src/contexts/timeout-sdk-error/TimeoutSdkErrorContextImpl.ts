import { ImportsManager, Reference } from "@fern-typescript/commons";
import { GeneratedTimeoutSdkError, TimeoutSdkErrorContext } from "@fern-typescript/contexts";
import { TimeoutSdkErrorGenerator } from "@fern-typescript/generic-sdk-error-generators";
import { SourceFile } from "ts-morph";

import { TimeoutSdkErrorDeclarationReferencer } from "../../declaration-referencers/TimeoutSdkErrorDeclarationReferencer";

export declare namespace TimeoutSdkErrorContextImpl {
    export interface Init {
        timeoutSdkErrorDeclarationReferencer: TimeoutSdkErrorDeclarationReferencer;
        timeoutSdkErrorGenerator: TimeoutSdkErrorGenerator;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class TimeoutSdkErrorContextImpl implements TimeoutSdkErrorContext {
    private timeoutSdkErrorDeclarationReferencer: TimeoutSdkErrorDeclarationReferencer;
    private timeoutSdkErrorGenerator: TimeoutSdkErrorGenerator;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        timeoutSdkErrorDeclarationReferencer,
        timeoutSdkErrorGenerator,
        importsManager,
        sourceFile
    }: TimeoutSdkErrorContextImpl.Init) {
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
        this.timeoutSdkErrorDeclarationReferencer = timeoutSdkErrorDeclarationReferencer;
        this.timeoutSdkErrorGenerator = timeoutSdkErrorGenerator;
    }

    public getReferenceToTimeoutSdkError(): Reference {
        return this.timeoutSdkErrorDeclarationReferencer.getReferenceToError({
            importsManager: this.importsManager,
            referencedIn: this.sourceFile
        });
    }

    public getGeneratedTimeoutSdkError(): GeneratedTimeoutSdkError {
        return this.timeoutSdkErrorGenerator.generateTimeoutSdkError({
            errorClassName: this.timeoutSdkErrorDeclarationReferencer.getExportedName()
        });
    }
}
