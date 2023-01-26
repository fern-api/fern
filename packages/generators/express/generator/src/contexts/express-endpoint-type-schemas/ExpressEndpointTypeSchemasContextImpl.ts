import { ExpressEndpointTypeSchemasContext } from "@fern-typescript/contexts";
import { ExpressEndpointTypeSchemasGenerator } from "@fern-typescript/express-endpoint-type-schemas-generator";
import { ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "../type/TypeSchemaContextMixinImpl";
import { ExpressEndpointTypeSchemasContextMixinImpl } from "./ExpressEndpointTypeSchemasContextMixinImpl";

export declare namespace ExpressEndpointTypeSchemasContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        expressEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        expressEndpointTypeSchemasGenerator: ExpressEndpointTypeSchemasGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class ExpressEndpointTypeSchemasContextImpl
    extends BaseContextImpl
    implements ExpressEndpointTypeSchemasContext
{
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly expressEndpointTypeSchemas: ExpressEndpointTypeSchemasContextMixinImpl;

    constructor({
        typeGenerator,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaGenerator,
        typeSchemaDeclarationReferencer,
        typeReferenceExampleGenerator,
        expressEndpointSchemaDeclarationReferencer,
        expressEndpointTypeSchemasGenerator,
        serviceResolver,
        ...superInit
    }: ExpressEndpointTypeSchemasContextImpl.Init) {
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
        this.expressEndpointTypeSchemas = new ExpressEndpointTypeSchemasContextMixinImpl({
            serviceResolver,
            expressEndpointTypeSchemasGenerator,
            expressEndpointSchemaDeclarationReferencer,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
        });
    }
}
