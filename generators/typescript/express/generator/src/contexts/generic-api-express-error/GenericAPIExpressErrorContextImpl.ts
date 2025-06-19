import { ExportsManager, ImportsManager, Reference } from "@fern-typescript/commons";
import { GeneratedGenericAPIExpressError, GenericAPIExpressErrorContext } from "@fern-typescript/contexts";
import { GenericAPIExpressErrorGenerator } from "@fern-typescript/generic-express-error-generators";
import { SourceFile } from "ts-morph";

import { GenericAPIExpressErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPIExpressErrorDeclarationReferencer";

export declare namespace GenericAPIExpressErrorContextImpl {
    export interface Init {
        genericAPIExpressErrorDeclarationReferencer: GenericAPIExpressErrorDeclarationReferencer;
        genericAPIExpressErrorGenerator: GenericAPIExpressErrorGenerator;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        sourceFile: SourceFile;
    }
}

export class GenericAPIExpressErrorContextImpl implements GenericAPIExpressErrorContext {
    private genericAPIExpressErrorDeclarationReferencer: GenericAPIExpressErrorDeclarationReferencer;
    private genericAPIExpressErrorGenerator: GenericAPIExpressErrorGenerator;
    private importsManager: ImportsManager;
    private exportsManager: ExportsManager;
    private sourceFile: SourceFile;

    constructor({
        genericAPIExpressErrorDeclarationReferencer,
        genericAPIExpressErrorGenerator,
        importsManager,
        exportsManager,
        sourceFile
    }: GenericAPIExpressErrorContextImpl.Init) {
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.sourceFile = sourceFile;
        this.genericAPIExpressErrorDeclarationReferencer = genericAPIExpressErrorDeclarationReferencer;
        this.genericAPIExpressErrorGenerator = genericAPIExpressErrorGenerator;
    }

    public getReferenceToGenericAPIExpressError(): Reference {
        return this.genericAPIExpressErrorDeclarationReferencer.getReferenceToError({
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            referencedIn: this.sourceFile
        });
    }

    public getGeneratedGenericAPIExpressError(): GeneratedGenericAPIExpressError {
        return this.genericAPIExpressErrorGenerator.generateGenericAPIExpressError({
            errorClassName: this.genericAPIExpressErrorDeclarationReferencer.getExportedName()
        });
    }
}
