import { ImportsManager, Reference } from "@fern-typescript/commons";
import { GeneratedGenericAPIExpressError, GenericAPIExpressErrorContextMixin } from "@fern-typescript/contexts";
import { GenericAPIExpressErrorGenerator } from "@fern-typescript/generic-express-error-generators";
import { SourceFile } from "ts-morph";
import { GenericAPIExpressErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPIExpressErrorDeclarationReferencer";

export declare namespace GenericAPIExpressErrorContextMixinImpl {
    export interface Init {
        genericAPIExpressErrorDeclarationReferencer: GenericAPIExpressErrorDeclarationReferencer;
        genericAPIExpressErrorGenerator: GenericAPIExpressErrorGenerator;
        importsManager: ImportsManager;
        sourceFile: SourceFile;
    }
}

export class GenericAPIExpressErrorContextMixinImpl implements GenericAPIExpressErrorContextMixin {
    private genericAPIExpressErrorDeclarationReferencer: GenericAPIExpressErrorDeclarationReferencer;
    private genericAPIExpressErrorGenerator: GenericAPIExpressErrorGenerator;
    private importsManager: ImportsManager;
    private sourceFile: SourceFile;

    constructor({
        genericAPIExpressErrorDeclarationReferencer,
        genericAPIExpressErrorGenerator,
        importsManager,
        sourceFile,
    }: GenericAPIExpressErrorContextMixinImpl.Init) {
        this.importsManager = importsManager;
        this.sourceFile = sourceFile;
        this.genericAPIExpressErrorDeclarationReferencer = genericAPIExpressErrorDeclarationReferencer;
        this.genericAPIExpressErrorGenerator = genericAPIExpressErrorGenerator;
    }

    public getReferenceToGenericAPIExpressError(): Reference {
        return this.genericAPIExpressErrorDeclarationReferencer.getReferenceToError({
            importsManager: this.importsManager,
            referencedIn: this.sourceFile,
        });
    }

    public getGeneratedGenericAPIExpressError(): GeneratedGenericAPIExpressError {
        return this.genericAPIExpressErrorGenerator.generateGenericAPIExpressError({
            errorClassName: this.genericAPIExpressErrorDeclarationReferencer.getExportedName(),
        });
    }
}
