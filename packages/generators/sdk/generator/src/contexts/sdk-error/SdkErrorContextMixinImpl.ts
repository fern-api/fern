import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ImportsManager, Reference } from "@fern-typescript/commons";
import { GeneratedSdkError, SdkErrorContextMixin } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { SourceFile } from "ts-morph";
import { SdkErrorDeclarationReferencer } from "../../declaration-referencers/SdkErrorDeclarationReferencer";

export declare namespace SdkErrorContextMixinImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        errorDeclarationReferencer: SdkErrorDeclarationReferencer;
        sdkErrorGenerator: SdkErrorGenerator;
        errorResolver: ErrorResolver;
    }
}

export class SdkErrorContextMixinImpl implements SdkErrorContextMixin {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private errorDeclarationReferencer: SdkErrorDeclarationReferencer;
    private sdkErrorGenerator: SdkErrorGenerator;
    private errorResolver: ErrorResolver;

    constructor({
        sourceFile,
        importsManager,
        errorDeclarationReferencer,
        sdkErrorGenerator,
        errorResolver,
    }: SdkErrorContextMixinImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.errorDeclarationReferencer = errorDeclarationReferencer;
        this.sdkErrorGenerator = sdkErrorGenerator;
        this.errorResolver = errorResolver;
    }

    public getReferenceToError(errorName: DeclaredErrorName): Reference {
        return this.errorDeclarationReferencer.getReferenceToError({
            name: errorName,
            importStrategy: { type: "fromRoot", namespaceImport: this.errorDeclarationReferencer.namespaceExport },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
        });
    }

    public getGeneratedSdkError(errorName: DeclaredErrorName): GeneratedSdkError | undefined {
        return this.sdkErrorGenerator.generateError({
            errorName: this.errorDeclarationReferencer.getExportedName(errorName),
            errorDeclaration: this.getErrorDeclaration(errorName),
        });
    }

    public getErrorDeclaration(errorName: DeclaredErrorName): ErrorDeclaration {
        return this.errorResolver.getErrorDeclarationFromName(errorName);
    }
}
