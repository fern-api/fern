import { GeneratedGenericAPIError, GenericAPIErrorContextMixin, Reference } from "@fern-typescript/contexts";
import { GenericAPIErrorGenerator } from "@fern-typescript/generic-error-generators";
import { SourceFile } from "ts-morph";
import { GenericAPIErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPIErrorDeclarationReferencer";
import { ImportsManager } from "../../imports-manager/ImportsManager";

export declare namespace GenericAPIErrorContextMixinImpl {
    export interface Init {
        genericAPIErrorDeclarationReferencer: GenericAPIErrorDeclarationReferencer;
        genericAPIErrorGenerator: GenericAPIErrorGenerator;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class GenericAPIErrorContextMixinImpl implements GenericAPIErrorContextMixin {
    private genericAPIErrorDeclarationReferencer: GenericAPIErrorDeclarationReferencer;
    private genericAPIErrorGenerator: GenericAPIErrorGenerator;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        genericAPIErrorDeclarationReferencer,
        genericAPIErrorGenerator,
        importsManager,
        sourceFile,
    }: GenericAPIErrorContextMixinImpl.Init) {
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
        this.genericAPIErrorDeclarationReferencer = genericAPIErrorDeclarationReferencer;
        this.genericAPIErrorGenerator = genericAPIErrorGenerator;
    }

    public getReferenceToGenericAPIError(): Reference {
        return this.genericAPIErrorDeclarationReferencer.getReferenceToError({
            importsManager: this.importsManager,
            referencedIn: this.sourceFile,
        });
    }

    public getGeneratedGenericAPIError(): GeneratedGenericAPIError {
        return this.genericAPIErrorGenerator.generateGenericAPIError({
            errorClassName: this.genericAPIErrorDeclarationReferencer.getExportedName(),
        });
    }
}
