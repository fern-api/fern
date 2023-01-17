import { TimeoutErrorContext, TimeoutErrorContextMixin } from "@fern-typescript/contexts";
import { TimeoutErrorGenerator } from "@fern-typescript/generic-error-generators";
import { TimeoutErrorDeclarationReferencer } from "../declaration-referencers/TimeoutErrorDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { TimeoutErrorContextMixinImpl } from "./mixins/TimeoutErrorContextMixinImpl";

export declare namespace TimeoutErrorContextImpl {
    export interface Init extends BaseContextImpl.Init {
        timeoutErrorDeclarationReferencer: TimeoutErrorDeclarationReferencer;
        timeoutErrorGenerator: TimeoutErrorGenerator;
    }
}

export class TimeoutErrorContextImpl extends BaseContextImpl implements TimeoutErrorContext {
    public readonly timeoutError: TimeoutErrorContextMixin;

    constructor({
        timeoutErrorDeclarationReferencer,
        timeoutErrorGenerator,
        ...superInit
    }: TimeoutErrorContextImpl.Init) {
        super(superInit);
        this.timeoutError = new TimeoutErrorContextMixinImpl({
            timeoutErrorDeclarationReferencer,
            timeoutErrorGenerator,
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }
}
