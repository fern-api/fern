import { ExpressServiceContext } from "@fern-typescript/contexts";
import { ExpressEndpointTypeSchemasGenerator } from "@fern-typescript/express-endpoint-type-schemas-generator";
import { ExpressInlinedRequestBodyGenerator } from "@fern-typescript/express-inlined-request-body-generator";
import { ExpressInlinedRequestBodySchemaGenerator } from "@fern-typescript/express-inlined-request-schema-generator";
import { ExpressServiceGenerator } from "@fern-typescript/express-service-generator";
import { ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { ExpressInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/ExpressInlinedRequestBodyDeclarationReferencer";
import { ExpressServiceDeclarationReferencer } from "../../declaration-referencers/ExpressServiceDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { ExpressEndpointTypeSchemasContextMixinImpl } from "../express-endpoint-type-schemas/ExpressEndpointTypeSchemasContextMixinImpl";
import { ExpressInlinedRequestBodySchemaContextMixinImpl } from "../express-inlined-request-body-schema/ExpressInlinedRequestBodySchemaContextMixinImpl";
import { ExpressInlinedRequestBodyContextMixinImpl } from "../express-inlined-request-body/ExpressInlinedRequestBodyContextMixinImpl.ts";
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
        serviceResolver: ServiceResolver;
        expressInlinedRequestBodyDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        expressInlinedRequestBodyGenerator: ExpressInlinedRequestBodyGenerator;
        expressInlinedRequestBodySchemaGenerator: ExpressInlinedRequestBodySchemaGenerator;
        expressInlinedRequestBodySchemaDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        expressEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        expressEndpointTypeSchemasGenerator: ExpressEndpointTypeSchemasGenerator;
        expressServiceGenerator: ExpressServiceGenerator;
        expressServiceDeclarationReferencer: ExpressServiceDeclarationReferencer;
    }
}

export class ExpressServiceContextImpl extends BaseContextImpl implements ExpressServiceContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly expressInlinedRequestBody: ExpressInlinedRequestBodyContextMixinImpl;
    public readonly expressInlinedRequestBodySchema: ExpressInlinedRequestBodySchemaContextMixinImpl;
    public readonly expressEndpointTypeSchemas: ExpressEndpointTypeSchemasContextMixinImpl;
    public readonly expressService: ExpressServiceContextMixinImpl;

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
        serviceResolver,
        expressServiceGenerator,
        expressServiceDeclarationReferencer,
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
        });
        this.expressInlinedRequestBody = new ExpressInlinedRequestBodyContextMixinImpl({
            expressInlinedRequestBodyDeclarationReferencer,
            expressInlinedRequestBodyGenerator,
            serviceResolver,
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
        });
        this.expressInlinedRequestBodySchema = new ExpressInlinedRequestBodySchemaContextMixinImpl({
            serviceResolver,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
            expressInlinedRequestBodySchemaGenerator,
            expressInlinedRequestBodySchemaDeclarationReferencer,
        });
        this.expressEndpointTypeSchemas = new ExpressEndpointTypeSchemasContextMixinImpl({
            serviceResolver,
            expressEndpointTypeSchemasGenerator,
            expressEndpointSchemaDeclarationReferencer,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
        });
        this.expressService = new ExpressServiceContextMixinImpl({
            serviceResolver,
            expressServiceGenerator,
            expressServiceDeclarationReferencer,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
        });
    }
}
