import { ExpressRegisterContext } from "@fern-typescript/contexts";
import { ExpressEndpointTypeSchemasGenerator } from "@fern-typescript/express-endpoint-type-schemas-generator";
import { ExpressInlinedRequestBodyGenerator } from "@fern-typescript/express-inlined-request-body-generator";
import { ExpressInlinedRequestBodySchemaGenerator } from "@fern-typescript/express-inlined-request-schema-generator";
import { ExpressRegisterGenerator } from "@fern-typescript/express-register-generator";
import { ExpressServiceGenerator } from "@fern-typescript/express-service-generator";
import { PackageResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { EndpointDeclarationReferencer } from "../../declaration-referencers/EndpointDeclarationReferencer";
import { ExpressInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/ExpressInlinedRequestBodyDeclarationReferencer";
import { ExpressServiceDeclarationReferencer } from "../../declaration-referencers/ExpressServiceDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { ExpressServiceContextMixinImpl } from "../express-service/ExpressServiceContextMixinImpl.ts";
import { ExpressRegisterContextMixinImpl } from "./ExpressRegisterContextMixinImpl.ts";

export declare namespace ExpressRegisterContextImpl {
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
        expressRegisterGenerator: ExpressRegisterGenerator;
    }
}

export class ExpressRegisterContextImpl extends BaseContextImpl implements ExpressRegisterContext {
    public readonly expressService: ExpressServiceContextMixinImpl;
    public readonly expressRegister: ExpressRegisterContextMixinImpl;

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
        expressRegisterGenerator,
        ...superInit
    }: ExpressRegisterContextImpl.Init) {
        super(superInit);
        this.expressService = new ExpressServiceContextMixinImpl({
            packageResolver,
            expressServiceGenerator,
            expressServiceDeclarationReferencer,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
        });
        this.expressRegister = new ExpressRegisterContextMixinImpl({
            expressRegisterGenerator,
        });
    }
}
