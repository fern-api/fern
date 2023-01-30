import { GenericAPIExpressErrorContext, GenericAPIExpressErrorContextMixin } from "@fern-typescript/contexts";
import { GenericAPIExpressErrorGenerator } from "@fern-typescript/generic-express-error-generators";
import { GenericAPIExpressErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPIExpressErrorDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { GenericAPIExpressErrorContextMixinImpl } from "./GenericAPIExpressErrorContextMixinImpl";

export declare namespace GenericAPIExpressErrorContextImpl {
    export interface Init extends BaseContextImpl.Init {
        genericAPIExpressErrorDeclarationReferencer: GenericAPIExpressErrorDeclarationReferencer;
        genericAPIExpressErrorGenerator: GenericAPIExpressErrorGenerator;
    }
}

export class GenericAPIExpressErrorContextImpl extends BaseContextImpl implements GenericAPIExpressErrorContext {
    public readonly genericAPIExpressError: GenericAPIExpressErrorContextMixin;

    constructor({
        genericAPIExpressErrorDeclarationReferencer,
        genericAPIExpressErrorGenerator,
        ...superInit
    }: GenericAPIExpressErrorContextImpl.Init) {
        super(superInit);
        this.genericAPIExpressError = new GenericAPIExpressErrorContextMixinImpl({
            genericAPIExpressErrorDeclarationReferencer,
            genericAPIExpressErrorGenerator,
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }
}
