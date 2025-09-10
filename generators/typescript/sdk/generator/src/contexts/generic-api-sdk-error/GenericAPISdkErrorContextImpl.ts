import { ExportsManager, ImportsManager, Reference } from "@fern-typescript/commons";
import { GeneratedGenericAPISdkError, GenericAPISdkErrorContext } from "@fern-typescript/contexts";
import { GenericAPISdkErrorGenerator } from "@fern-typescript/generic-sdk-error-generators";
import { SourceFile } from "ts-morph";

import { GenericAPISdkErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPISdkErrorDeclarationReferencer";

export declare namespace GenericAPISdkErrorContextImpl {
    export interface Init {
        genericAPISdkErrorDeclarationReferencer: GenericAPISdkErrorDeclarationReferencer;
        genericAPISdkErrorGenerator: GenericAPISdkErrorGenerator;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }
}

export class GenericAPISdkErrorContextImpl implements GenericAPISdkErrorContext {
    private genericAPISdkErrorDeclarationReferencer: GenericAPISdkErrorDeclarationReferencer;
    private genericAPISdkErrorGenerator: GenericAPISdkErrorGenerator;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private sourceFile: SourceFile;

    constructor({
        genericAPISdkErrorDeclarationReferencer,
        genericAPISdkErrorGenerator,
        importsManager,
        exportsManager,
        sourceFile
    }: GenericAPISdkErrorContextImpl.Init) {
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.sourceFile = sourceFile;
        this.genericAPISdkErrorDeclarationReferencer = genericAPISdkErrorDeclarationReferencer;
        this.genericAPISdkErrorGenerator = genericAPISdkErrorGenerator;
    }

    public getReferenceToGenericAPISdkError(): Reference {
        return this.genericAPISdkErrorDeclarationReferencer.getReferenceToError({
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            referencedIn: this.sourceFile
        });
    }

    public getGeneratedGenericAPISdkError(): GeneratedGenericAPISdkError {
        return this.genericAPISdkErrorGenerator.generateGenericAPISdkError({
            errorClassName: this.genericAPISdkErrorDeclarationReferencer.getExportedName()
        });
    }
}
