import { DeclaredErrorName } from "@fern-fern/ir-model/errors";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { ErrorContextMixin, GeneratedError, Reference } from "@fern-typescript/sdk-declaration-handler";
import { SourceFile } from "ts-morph";
import { ErrorDeclarationReferencer } from "../../declaration-referencers/ErrorDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";

export declare namespace ErrorContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        errorGenerator: ErrorGenerator;
        errorResolver: ErrorResolver;
    }
}

export class ErrorContextMixinImpl implements ErrorContextMixin {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private errorDeclarationReferencer: ErrorDeclarationReferencer;
    private errorGenerator: ErrorGenerator;
    private errorResolver: ErrorResolver;

    constructor({
        sourceFile,
        importsManager,
        errorDeclarationReferencer,
        errorGenerator,
        errorResolver,
    }: ErrorContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.errorDeclarationReferencer = errorDeclarationReferencer;
        this.errorGenerator = errorGenerator;
        this.errorResolver = errorResolver;
    }

    public getReferenceToError(errorName: DeclaredErrorName): Reference {
        return this.errorDeclarationReferencer.getReferenceToError({
            name: errorName,
            importStrategy: { type: "fromRoot" },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
        });
    }

    public getGeneratedError(errorName: DeclaredErrorName): GeneratedError | undefined {
        return this.errorGenerator.generateError({
            errorName: this.errorDeclarationReferencer.getExportedName(errorName),
            errorDeclaration: this.errorResolver.getErrorDeclarationFromName(errorName),
        });
    }
}
