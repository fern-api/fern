import { GenericAPIErrorContext, GenericAPIErrorContextMixin } from "@fern-typescript/contexts";
import { GenericAPIErrorGenerator } from "@fern-typescript/generic-error-generators";
import { GenericAPIErrorDeclarationReferencer } from "../declaration-referencers/GenericAPIErrorDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { GenericAPIErrorContextMixinImpl } from "./mixins/GenericAPIErrorContextMixinImpl";

export declare namespace GenericAPIErrorContextImpl {
    export interface Init extends BaseContextImpl.Init {
        genericAPIErrorDeclarationReferencer: GenericAPIErrorDeclarationReferencer;
        genericAPIErrorGenerator: GenericAPIErrorGenerator;
    }
}

export class GenericAPIErrorContextImpl extends BaseContextImpl implements GenericAPIErrorContext {
    public readonly genericAPIError: GenericAPIErrorContextMixin;

    constructor({
        genericAPIErrorDeclarationReferencer,
        genericAPIErrorGenerator,
        ...superInit
    }: GenericAPIErrorContextImpl.Init) {
        super(superInit);
        this.genericAPIError = new GenericAPIErrorContextMixinImpl({
            genericAPIErrorDeclarationReferencer,
            genericAPIErrorGenerator,
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }
}
