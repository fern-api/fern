import { ExpressServiceContext, GenericAPIExpressErrorContextMixin } from "@fern-typescript/contexts";
import { ExpressEndpointTypeSchemasGenerator } from "@fern-typescript/express-endpoint-type-schemas-generator";
import { ExpressErrorGenerator } from "@fern-typescript/express-error-generator";
import { ExpressInlinedRequestBodyGenerator } from "@fern-typescript/express-inlined-request-body-generator";
import { ExpressInlinedRequestBodySchemaGenerator } from "@fern-typescript/express-inlined-request-schema-generator";
import { ExpressServiceGenerator } from "@fern-typescript/express-service-generator";
import { GenericAPIExpressErrorGenerator } from "@fern-typescript/generic-express-error-generators";
import { ErrorResolver, PackageResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { ExpressErrorDeclarationReferencer } from "../../declaration-referencers/ExpressErrorDeclarationReferencer";
import { ExpressInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/ExpressInlinedRequestBodyDeclarationReferencer";
import { ExpressServiceDeclarationReferencer } from "../../declaration-referencers/ExpressServiceDeclarationReferencer";
import { GenericAPIExpressErrorDeclarationReferencer } from "../../declaration-referencers/GenericAPIExpressErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { ExpressEndpointTypeSchemasContextMixinImpl } from "../express-endpoint-type-schemas/ExpressEndpointTypeSchemasContextMixinImpl";
import { ExpressErrorContextMixinImpl } from "../express-error/ExpressErrorContextMixinImpl";
import { ExpressInlinedRequestBodySchemaContextMixinImpl } from "../express-inlined-request-body-schema/ExpressInlinedRequestBodySchemaContextMixinImpl";
import { ExpressInlinedRequestBodyContextMixinImpl } from "../express-inlined-request-body/ExpressInlinedRequestBodyContextMixinImpl.ts";
import { GenericAPIExpressErrorContextMixinImpl } from "../generic-api-express-error/GenericAPIExpressErrorContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "../type-schema/TypeSchemaContextMixinImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { ExpressServiceContextMixinImpl } from "./ExpressServiceContextMixinImpl.ts";

export declare namespace ExpressServiceContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        packageResolver: PackageResolver;
        expressInlinedRequestBodyDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        expressInlinedRequestBodyGenerator: ExpressInlinedRequestBodyGenerator;
        expressInlinedRequestBodySchemaGenerator: ExpressInlinedRequestBodySchemaGenerator;
        expressInlinedRequestBodySchemaDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        expressEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        expressEndpointTypeSchemasGenerator: ExpressEndpointTypeSchemasGenerator;
        expressServiceGenerator: ExpressServiceGenerator;
        expressServiceDeclarationReferencer: ExpressServiceDeclarationReferencer;
        errorDeclarationReferencer: ExpressErrorDeclarationReferencer;
        expressErrorGenerator: ExpressErrorGenerator;
        errorResolver: ErrorResolver;
        genericAPIExpressErrorDeclarationReferencer: GenericAPIExpressErrorDeclarationReferencer;
        genericAPIExpressErrorGenerator: GenericAPIExpressErrorGenerator;
        treatUnknownAsAny: boolean;
    }
}

export class ExpressServiceContextImpl extends BaseContextImpl implements ExpressServiceContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly expressInlinedRequestBody: ExpressInlinedRequestBodyContextMixinImpl;
    public readonly expressInlinedRequestBodySchema: ExpressInlinedRequestBodySchemaContextMixinImpl;
    public readonly expressEndpointTypeSchemas: ExpressEndpointTypeSchemasContextMixinImpl;
    public readonly expressService: ExpressServiceContextMixinImpl;
    public readonly expressError: ExpressErrorContextMixinImpl;
    public readonly genericAPIExpressError: GenericAPIExpressErrorContextMixin;

    constructor({
        typeResolver,
        typeGenerator,
        typeDeclarationReferencer,
        typeSchemaDeclarationReferencer,
        typeSchemaGenerator,
        typeReferenceExampleGenerator,
        expressInlinedRequestBodyDeclarationReferencer,
        expressInlinedRequestBodyGenerator,
        expressEndpointSchemaDeclarationReferencer,
        expressEndpointTypeSchemasGenerator,
        expressInlinedRequestBodySchemaDeclarationReferencer,
        expressInlinedRequestBodySchemaGenerator,
        packageResolver,
        expressServiceGenerator,
        expressServiceDeclarationReferencer,
        errorDeclarationReferencer,
        errorResolver,
        expressErrorGenerator,
        genericAPIExpressErrorDeclarationReferencer,
        genericAPIExpressErrorGenerator,
        treatUnknownAsAny,
        ...superInit
    }: ExpressServiceContextImpl.Init) {
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
        this.expressInlinedRequestBody = new ExpressInlinedRequestBodyContextMixinImpl({
            expressInlinedRequestBodyDeclarationReferencer,
            expressInlinedRequestBodyGenerator,
            packageResolver,
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
        });
        this.expressInlinedRequestBodySchema = new ExpressInlinedRequestBodySchemaContextMixinImpl({
            packageResolver,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
            expressInlinedRequestBodySchemaGenerator,
            expressInlinedRequestBodySchemaDeclarationReferencer,
        });
        this.expressEndpointTypeSchemas = new ExpressEndpointTypeSchemasContextMixinImpl({
            packageResolver,
            expressEndpointTypeSchemasGenerator,
            expressEndpointSchemaDeclarationReferencer,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
        });
        this.expressService = new ExpressServiceContextMixinImpl({
            packageResolver,
            expressServiceGenerator,
            expressServiceDeclarationReferencer,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
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
