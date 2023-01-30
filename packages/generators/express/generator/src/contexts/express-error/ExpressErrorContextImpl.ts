import { ExpressErrorContext, GenericAPIExpressErrorContextMixin } from "@fern-typescript/contexts";
import { ExpressErrorGenerator } from "@fern-typescript/express-error-generator";
import { GenericAPIExpressErrorGenerator } from "@fern-typescript/generic-express-error-generators";
import { ErrorResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { ExpressErrorDeclarationReferencer } from "../../declaration-referencers/ExpressErrorDeclarationReferencer";
import { GenericAPIExpressErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPIExpressErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { GenericAPIExpressErrorContextMixinImpl } from "../generic-api-express-error/GenericAPIExpressErrorContextMixinImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { ExpressErrorContextMixinImpl } from "./ExpressErrorContextMixinImpl";

export declare namespace ExpressErrorContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        errorDeclarationReferencer: ExpressErrorDeclarationReferencer;
        expressErrorGenerator: ExpressErrorGenerator;
        errorResolver: ErrorResolver;
        genericAPIExpressErrorDeclarationReferencer: GenericAPIExpressErrorDeclarationReferencer;
        genericAPIExpressErrorGenerator: GenericAPIExpressErrorGenerator;
    }
}

export class ExpressErrorContextImpl extends BaseContextImpl implements ExpressErrorContext {
    public readonly type: TypeContextMixinImpl;
    public readonly expressError: ExpressErrorContextMixinImpl;
    public readonly genericAPIExpressError: GenericAPIExpressErrorContextMixin;

    constructor({
        typeResolver,
        typeDeclarationReferencer,
        typeGenerator,
        errorDeclarationReferencer,
        expressErrorGenerator,
        errorResolver,
        typeReferenceExampleGenerator,
        genericAPIExpressErrorDeclarationReferencer,
        genericAPIExpressErrorGenerator,
        ...superInit
    }: ExpressErrorContextImpl.Init) {
        super(superInit);
        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeGenerator,
            typeDeclarationReferencer,
            typeReferenceExampleGenerator,
        });
        this.expressError = new ExpressErrorContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            expressErrorGenerator,
            errorResolver,
        });
        this.genericAPIExpressError = new GenericAPIExpressErrorContextMixinImpl({
            genericAPIExpressErrorDeclarationReferencer,
            genericAPIExpressErrorGenerator,
            importsManager: this.importsManager,
            sourceFile: this.sourceFile,
        });
    }
}
