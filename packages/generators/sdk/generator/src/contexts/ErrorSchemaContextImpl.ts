import { ErrorSchemaContext } from "@fern-typescript/contexts";
import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorSchemaGenerator } from "@fern-typescript/error-schema-generator";
import { ErrorResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { ErrorContextMixinImpl } from "./mixins/ErrorContextMixinImpl";
import { ErrorSchemaContextMixinImpl } from "./mixins/ErrorSchemaContextMixinImpl";
import { TypeContextMixinImpl } from "./mixins/TypeContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "./mixins/TypeSchemaContextMixinImpl";

export declare namespace ErrorSchemaContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        errorSchemaDeclarationReferencer: ErrorDeclarationReferencer;
        errorSchemaGenerator: ErrorSchemaGenerator;
        errorGenerator: ErrorGenerator;
        errorResolver: ErrorResolver;
    }
}

export class ErrorSchemaContextImpl extends BaseContextImpl implements ErrorSchemaContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly error: ErrorContextMixinImpl;
    public readonly errorSchema: ErrorSchemaContextMixinImpl;

    constructor({
        typeGenerator,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaDeclarationReferencer,
        typeSchemaGenerator,
        typeReferenceExampleGenerator,
        errorDeclarationReferencer,
        errorSchemaDeclarationReferencer,
        errorSchemaGenerator,
        errorGenerator,
        errorResolver,
        ...superInit
    }: ErrorSchemaContextImpl.Init) {
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
        this.error = new ErrorContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            errorGenerator,
            errorResolver,
        });
        this.errorSchema = new ErrorSchemaContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            coreUtilities: this.base.coreUtilities,
            errorSchemaDeclarationReferencer,
            errorSchemaGenerator,
            errorResolver,
        });
    }
}
