import { ExpressErrorSchemaContext, GenericAPIExpressErrorContextMixin } from "@fern-typescript/contexts";
import { ExpressErrorGenerator } from "@fern-typescript/express-error-generator";
import { ExpressErrorSchemaGenerator } from "@fern-typescript/express-error-schema-generator";
import { GenericAPIExpressErrorGenerator } from "@fern-typescript/generic-express-error-generators";
import { ErrorResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { ExpressErrorDeclarationReferencer } from "../../declaration-referencers/ExpressErrorDeclarationReferencer";
import { GenericAPIExpressErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPIExpressErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { ExpressErrorContextMixinImpl } from "../express-error/ExpressErrorContextMixinImpl";
import { GenericAPIExpressErrorContextMixinImpl } from "../generic-api-express-error/GenericAPIExpressErrorContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "../type-schema/TypeSchemaContextMixinImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { ExpressErrorSchemaContextMixinImpl } from "./ExpressErrorSchemaContextMixinImpl";

export declare namespace ExpressErrorSchemaContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        errorDeclarationReferencer: ExpressErrorDeclarationReferencer;
        expressErrorSchemaDeclarationReferencer: ExpressErrorDeclarationReferencer;
        expressErrorSchemaGenerator: ExpressErrorSchemaGenerator;
        expressErrorGenerator: ExpressErrorGenerator;
        errorResolver: ErrorResolver;
        genericAPIExpressErrorDeclarationReferencer: GenericAPIExpressErrorDeclarationReferencer;
        genericAPIExpressErrorGenerator: GenericAPIExpressErrorGenerator;
        treatUnknownAsAny: boolean;
    }
}

export class ExpressErrorSchemaContextImpl extends BaseContextImpl implements ExpressErrorSchemaContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly expressError: ExpressErrorContextMixinImpl;
    public readonly expressErrorSchema: ExpressErrorSchemaContextMixinImpl;
    public readonly genericAPIExpressError: GenericAPIExpressErrorContextMixin;

    constructor({
        typeGenerator,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaDeclarationReferencer,
        typeSchemaGenerator,
        typeReferenceExampleGenerator,
        errorDeclarationReferencer,
        expressErrorSchemaDeclarationReferencer,
        expressErrorSchemaGenerator,
        expressErrorGenerator,
        errorResolver,
        genericAPIExpressErrorDeclarationReferencer,
        genericAPIExpressErrorGenerator,
        treatUnknownAsAny,
        ...superInit
    }: ExpressErrorSchemaContextImpl.Init) {
        super(superInit);
        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
            typeReferenceExampleGenerator,
            treatUnknownAsAny,
        });
        this.typeSchema = new TypeSchemaContextMixinImpl({
            sourceFile: this.base.sourceFile,
            coreUtilities: this.base.coreUtilities,
            importsManager: this.importsManager,
            typeResolver,
            typeSchemaDeclarationReferencer,
            typeDeclarationReferencer,
            typeGenerator,
            typeSchemaGenerator,
            treatUnknownAsAny,
        });
        this.expressError = new ExpressErrorContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            expressErrorGenerator,
            errorResolver,
        });
        this.expressErrorSchema = new ExpressErrorSchemaContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            coreUtilities: this.base.coreUtilities,
            expressErrorSchemaDeclarationReferencer,
            expressErrorSchemaGenerator,
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
