import { TimeoutSdkErrorContext, TimeoutSdkErrorContextMixin } from "@fern-typescript/contexts";
import { TimeoutSdkErrorGenerator } from "@fern-typescript/generic-sdk-error-generators";
import { TimeoutSdkErrorDeclarationReferencer } from "../../declaration-referencers/TimeoutSdkErrorDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { TimeoutSdkErrorContextMixinImpl } from "./TimeoutSdkErrorContextMixinImpl";

export declare namespace TimeoutSdkErrorContextImpl {
    export interface Init extends BaseContextImpl.Init {
        timeoutSdkErrorDeclarationReferencer: TimeoutSdkErrorDeclarationReferencer;
        timeoutSdkErrorGenerator: TimeoutSdkErrorGenerator;
    }
}

export class TimeoutSdkErrorContextImpl extends BaseContextImpl implements TimeoutSdkErrorContext {
    public readonly timeoutSdkError: TimeoutSdkErrorContextMixin;

    constructor({
        timeoutSdkErrorDeclarationReferencer,
        timeoutSdkErrorGenerator,
        ...superInit
    }: TimeoutSdkErrorContextImpl.Init) {
        super(superInit);
        this.timeoutSdkError = new TimeoutSdkErrorContextMixinImpl({
            timeoutSdkErrorDeclarationReferencer,
            timeoutSdkErrorGenerator,
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }
}
