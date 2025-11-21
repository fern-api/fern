import { DeclaredErrorName, ErrorDeclaration } from "@fern-fern/ir-sdk/api";
import { ExportsManager, ImportsManager, Reference } from "@fern-typescript/commons";
import { GeneratedSdkError, SdkErrorContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { SourceFile } from "ts-morph";

import { SdkErrorDeclarationReferencer } from "../../declaration-referencers/SdkErrorDeclarationReferencer";

export declare namespace SdkErrorContextImpl {
    export interface Init {
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        errorDeclarationReferencer: SdkErrorDeclarationReferencer;
        sdkErrorGenerator: SdkErrorGenerator;
        errorResolver: ErrorResolver;
    }
}

export class SdkErrorContextImpl implements SdkErrorContext {
    private sourceFile: SourceFile;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private errorDeclarationReferencer: SdkErrorDeclarationReferencer;
    private sdkErrorGenerator: SdkErrorGenerator;
    private errorResolver: ErrorResolver;

    constructor({
        sourceFile,
        importsManager,
        exportsManager,
        errorDeclarationReferencer,
        sdkErrorGenerator,
        errorResolver
    }: SdkErrorContextImpl.Init) {
        this.sourceFile = sourceFile;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.errorDeclarationReferencer = errorDeclarationReferencer;
        this.sdkErrorGenerator = sdkErrorGenerator;
        this.errorResolver = errorResolver;
    }

    public getReferenceToError(errorName: DeclaredErrorName): Reference {
        return this.errorDeclarationReferencer.getReferenceToError({
            name: errorName,
            importStrategy: { type: "direct" },
            referencedIn: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager
        });
    }

    public getGeneratedSdkError(errorName: DeclaredErrorName): GeneratedSdkError | undefined {
        return this.sdkErrorGenerator.generateError({
            errorName: this.errorDeclarationReferencer.getExportedName(errorName),
            errorDeclaration: this.getErrorDeclaration(errorName)
        });
    }

    public getErrorDeclaration(errorName: DeclaredErrorName): ErrorDeclaration {
        return this.errorResolver.getErrorDeclarationFromName(errorName);
    }
}
