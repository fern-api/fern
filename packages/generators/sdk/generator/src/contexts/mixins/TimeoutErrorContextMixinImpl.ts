import { GeneratedTimeoutError, Reference, TimeoutErrorContextMixin } from "@fern-typescript/contexts";
import { TimeoutErrorGenerator } from "@fern-typescript/generic-error-generators";
import { SourceFile } from "ts-morph";
import { TimeoutErrorDeclarationReferencer } from "../../declaration-referencers/TimeoutErrorDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";

export declare namespace TimeoutErrorContextMixinImpl {
    export interface Init {
        timeoutErrorDeclarationReferencer: TimeoutErrorDeclarationReferencer;
        timeoutErrorGenerator: TimeoutErrorGenerator;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class TimeoutErrorContextMixinImpl implements TimeoutErrorContextMixin {
    private timeoutErrorDeclarationReferencer: TimeoutErrorDeclarationReferencer;
    private timeoutErrorGenerator: TimeoutErrorGenerator;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        timeoutErrorDeclarationReferencer,
        timeoutErrorGenerator,
        importsManager,
        sourceFile,
    }: TimeoutErrorContextMixinImpl.Init) {
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
        this.timeoutErrorDeclarationReferencer = timeoutErrorDeclarationReferencer;
        this.timeoutErrorGenerator = timeoutErrorGenerator;
    }

    public getReferenceToTimeoutError(): Reference {
        return this.timeoutErrorDeclarationReferencer.getReferenceToError({
            importsManager: this.importsManager,
            referencedIn: this.sourceFile,
        });
    }

    public getGeneratedTimeoutError(): GeneratedTimeoutError {
        return this.timeoutErrorGenerator.generateTimeoutError({
            errorClassName: this.timeoutErrorDeclarationReferencer.getExportedName(),
        });
    }
}
