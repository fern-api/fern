import { GenericAPISdkErrorContext, GenericAPISdkErrorContextMixin } from "@fern-typescript/contexts";
import { GenericAPISdkErrorGenerator } from "@fern-typescript/generic-sdk-error-generators";
import { GenericAPISdkErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPISdkErrorDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { GenericAPISdkErrorContextMixinImpl } from "./GenericAPISdkErrorContextMixinImpl";

export declare namespace GenericAPISdkErrorContextImpl {
    export interface Init extends BaseContextImpl.Init {
        genericAPISdkErrorDeclarationReferencer: GenericAPISdkErrorDeclarationReferencer;
        genericAPISdkErrorGenerator: GenericAPISdkErrorGenerator;
    }
}

export class GenericAPISdkErrorContextImpl extends BaseContextImpl implements GenericAPISdkErrorContext {
    public readonly genericAPISdkError: GenericAPISdkErrorContextMixin;

    constructor({
        genericAPISdkErrorDeclarationReferencer,
        genericAPISdkErrorGenerator,
        ...superInit
    }: GenericAPISdkErrorContextImpl.Init) {
        super(superInit);
        this.genericAPISdkError = new GenericAPISdkErrorContextMixinImpl({
            genericAPISdkErrorDeclarationReferencer,
            genericAPISdkErrorGenerator,
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }
}
