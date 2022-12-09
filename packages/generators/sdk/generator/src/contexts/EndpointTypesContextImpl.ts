import { EndpointTypesContext } from "@fern-typescript/contexts";
import { EndpointTypesGenerator } from "@fern-typescript/endpoint-types-generator";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorResolver, ServiceResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { EndpointTypesContextMixinImpl } from "./mixins/EndpointTypesContextMixinImpl";
import { ErrorContextMixinImpl } from "./mixins/ErrorContextMixinImpl";
import { TypeContextMixinImpl } from "./mixins/TypeContextMixinImpl";

export declare namespace EndpointTypesContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        errorResolver: ErrorResolver;
        errorGenerator: ErrorGenerator;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        endpointDeclarationReferencer: EndpointDeclarationReferencer;
        endpointTypesGenerator: EndpointTypesGenerator;
        serviceResolver: ServiceResolver;
    }
}

export class EndpointTypesContextImpl extends BaseContextImpl implements EndpointTypesContext {
    public readonly type: TypeContextMixinImpl;
    public readonly error: ErrorContextMixinImpl;
    public readonly endpointTypes: EndpointTypesContextMixinImpl;

    constructor({
        typeResolver,
        typeGenerator,
        typeDeclarationReferencer,
        typeReferenceExampleGenerator,
        errorGenerator,
        errorResolver,
        errorDeclarationReferencer,
        endpointDeclarationReferencer,
        endpointTypesGenerator,
        serviceResolver,
        ...superInit
    }: EndpointTypesContextImpl.Init) {
        super(superInit);
        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
            typeReferenceExampleGenerator,
        });
        this.error = new ErrorContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            errorGenerator,
            errorResolver,
        });
        this.endpointTypes = new EndpointTypesContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            endpointDeclarationReferencer,
            endpointTypesGenerator,
            serviceResolver,
        });
    }
}
