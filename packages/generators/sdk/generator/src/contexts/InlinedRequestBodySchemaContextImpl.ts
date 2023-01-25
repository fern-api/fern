import { InlinedRequestBodySchemaContext } from "@fern-typescript/contexts";
import { InlinedRequestBodySchemaGenerator } from "@fern-typescript/inlined-request-schema-generator";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { InlinedRequestBodySchemaDeclarationReferencer } from "../declaration-referencers/InlinedRequestBodySchemaDeclarationReferencer";
import { RequestWrapperDeclarationReferencer } from "../declaration-referencers/RequestWrapperDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { InlinedRequestBodySchemaContextMixinImpl } from "./mixins/InlinedRequestBodySchemaContextMixinImpl";
import { RequestWrapperContextMixinImpl } from "./mixins/RequestWrapperContextMixinImpl";
import { TypeContextMixinImpl } from "./mixins/TypeContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "./mixins/TypeSchemaContextMixinImpl";

export declare namespace InlinedRequestBodySchemaContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        requestWrapperGenerator: RequestWrapperGenerator;
        inlinedRequestBodySchemaGenerator: InlinedRequestBodySchemaGenerator;
        inlinedRequestBodySchemaDeclarationReferencer: InlinedRequestBodySchemaDeclarationReferencer;
        serviceResolver: ServiceResolver;
    }
}

export class InlinedRequestBodySchemaContextImpl extends BaseContextImpl implements InlinedRequestBodySchemaContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly requestWrapper: RequestWrapperContextMixinImpl;
    public readonly inlinedRequestBodySchema: InlinedRequestBodySchemaContextMixinImpl;

    constructor({
        typeGenerator,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaGenerator,
        typeSchemaDeclarationReferencer,
        typeReferenceExampleGenerator,
        requestWrapperDeclarationReferencer,
        inlinedRequestBodySchemaGenerator,
        inlinedRequestBodySchemaDeclarationReferencer,
        requestWrapperGenerator,
        serviceResolver,
        ...superInit
    }: InlinedRequestBodySchemaContextImpl.Init) {
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
        this.requestWrapper = new RequestWrapperContextMixinImpl({
            requestWrapperDeclarationReferencer,
            requestWrapperGenerator,
            serviceResolver,
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
        });
        this.inlinedRequestBodySchema = new InlinedRequestBodySchemaContextMixinImpl({
            serviceResolver,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
            inlinedRequestBodySchemaGenerator,
            inlinedRequestBodySchemaDeclarationReferencer,
        });
    }
}
