import { ExpressInlinedRequestBodyContext } from "@fern-typescript/contexts";
import { ExpressInlinedRequestBodyGenerator } from "@fern-typescript/express-inlined-request-body-generator";
import { ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { ExpressInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/ExpressInlinedRequestBodyDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { ExpressInlinedRequestBodyContextMixinImpl } from "./ExpressInlinedRequestBodyContextMixinImpl.ts";

export declare namespace ExpressInlinedRequestBodyContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        serviceResolver: ServiceResolver;
        expressInlinedRequestBodyDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        expressInlinedRequestBodyGenerator: ExpressInlinedRequestBodyGenerator;
    }
}

export class ExpressInlinedRequestBodyContextImpl extends BaseContextImpl implements ExpressInlinedRequestBodyContext {
    public readonly type: TypeContextMixinImpl;
    public readonly expressInlinedRequestBody: ExpressInlinedRequestBodyContextMixinImpl;

    constructor({
        typeResolver,
        typeGenerator,
        typeDeclarationReferencer,
        typeReferenceExampleGenerator,
        expressInlinedRequestBodyDeclarationReferencer,
        expressInlinedRequestBodyGenerator,
        serviceResolver,
        ...superInit
    }: ExpressInlinedRequestBodyContextImpl.Init) {
        super(superInit);
        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
            typeReferenceExampleGenerator,
        });
        this.expressInlinedRequestBody = new ExpressInlinedRequestBodyContextMixinImpl({
            expressInlinedRequestBodyDeclarationReferencer,
            expressInlinedRequestBodyGenerator,
            serviceResolver,
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
        });
    }
}
