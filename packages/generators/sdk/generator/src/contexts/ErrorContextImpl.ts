import { ErrorGenerator } from "@fern-typescript/error-generator";
import { ErrorResolver, TypeResolver } from "@fern-typescript/resolvers";
import { ErrorContext } from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { ErrorDeclarationReferencer } from "../declaration-referencers/ErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { ErrorContextMixinImpl } from "./mixins/ErrorContextMixinImpl";
import { TypeContextMixinImpl } from "./mixins/TypeContextMixinImpl";

export declare namespace ErrorContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        errorDeclarationReferencer: ErrorDeclarationReferencer;
        errorGenerator: ErrorGenerator;
        errorResolver: ErrorResolver;
    }
}

export class ErrorContextImpl extends BaseContextImpl implements ErrorContext {
    public readonly type: TypeContextMixinImpl;
    public readonly error: ErrorContextMixinImpl;

    constructor({
        typeResolver,
        typeDeclarationReferencer,
        typeGenerator,
        errorDeclarationReferencer,
        errorGenerator,
        errorResolver,
        ...superInit
    }: ErrorContextImpl.Init) {
        super(superInit);
        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeGenerator,
            typeDeclarationReferencer,
        });
        this.error = new ErrorContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            errorDeclarationReferencer,
            errorGenerator,
            errorResolver,
        });
    }
}
