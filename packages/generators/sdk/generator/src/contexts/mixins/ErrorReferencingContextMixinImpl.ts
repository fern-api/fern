import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { ErrorReferencingContextMixin, Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile } from "ts-morph";
import { ErrorDeclarationReferencer } from "../../declaration-referencers/ErrorDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";

export declare namespace ErrorReferencingContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
    }
}

export class ErrorReferencingContextMixinImpl implements ErrorReferencingContextMixin {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private errorDeclarationReferencer: ErrorDeclarationReferencer;

    constructor({ sourceFile, importsManager, errorDeclarationReferencer }: ErrorReferencingContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.errorDeclarationReferencer = errorDeclarationReferencer;
    }

    public getReferenceToError(errorName: DeclaredErrorName): Reference {
        return this.errorDeclarationReferencer.getReferenceToError({
            name: errorName,
            importStrategy: { type: "fromRoot" },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
        });
    }
}
