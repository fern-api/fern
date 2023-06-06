import { ExpressInlinedRequestBodySchemaContext } from "@fern-typescript/contexts";
import { ExpressInlinedRequestBodyGenerator } from "@fern-typescript/express-inlined-request-body-generator";
import { ExpressInlinedRequestBodySchemaGenerator } from "@fern-typescript/express-inlined-request-schema-generator";
import { PackageResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { ExpressInlinedRequestBodyDeclarationReferencer } from "../../declaration-referencers/ExpressInlinedRequestBodyDeclarationReferencer";
import { TypeDeclarationReferencer } from "../../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "../base/BaseContextImpl";
import { ExpressInlinedRequestBodyContextMixinImpl } from "../express-inlined-request-body/ExpressInlinedRequestBodyContextMixinImpl.ts";
import { TypeSchemaContextMixinImpl } from "../type-schema/TypeSchemaContextMixinImpl";
import { TypeContextMixinImpl } from "../type/TypeContextMixinImpl";
import { ExpressInlinedRequestBodySchemaContextMixinImpl } from "./ExpressInlinedRequestBodySchemaContextMixinImpl";

export declare namespace ExpressInlinedRequestBodySchemaContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        expressInlinedRequestBodyGenerator: ExpressInlinedRequestBodyGenerator;
        expressInlinedRequestBodyDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        expressInlinedRequestBodySchemaGenerator: ExpressInlinedRequestBodySchemaGenerator;
        expressInlinedRequestBodySchemaDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        packageResolver: PackageResolver;
        treatUnknownAsAny: boolean;
    }
}

export class ExpressInlinedRequestBodySchemaContextImpl
    extends BaseContextImpl
    implements ExpressInlinedRequestBodySchemaContext
{
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;
    public readonly expressInlinedRequestBody: ExpressInlinedRequestBodyContextMixinImpl;
    public readonly expressInlinedRequestBodySchema: ExpressInlinedRequestBodySchemaContextMixinImpl;

    constructor({
        typeGenerator,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaGenerator,
        typeSchemaDeclarationReferencer,
        typeReferenceExampleGenerator,
        expressInlinedRequestBodyGenerator,
        expressInlinedRequestBodyDeclarationReferencer,
        expressInlinedRequestBodySchemaGenerator,
        expressInlinedRequestBodySchemaDeclarationReferencer,
        packageResolver,
        treatUnknownAsAny,
        ...superInit
    }: ExpressInlinedRequestBodySchemaContextImpl.Init) {
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
            packageResolver,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
            expressInlinedRequestBodyGenerator,
            expressInlinedRequestBodyDeclarationReferencer,
        });
        this.expressInlinedRequestBodySchema = new ExpressInlinedRequestBodySchemaContextMixinImpl({
            packageResolver,
            importsManager: this.importsManager,
            sourceFile: this.base.sourceFile,
            expressInlinedRequestBodySchemaGenerator,
            expressInlinedRequestBodySchemaDeclarationReferencer,
        });
    }
}
