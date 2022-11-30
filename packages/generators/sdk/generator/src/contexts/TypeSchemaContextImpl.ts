import { TypeResolver } from "@fern-typescript/resolvers";
import { TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { TypeContextMixinImpl } from "./mixins/TypeContextMixinImpl";
import { TypeSchemaContextMixinImpl } from "./mixins/TypeSchemaContextMixinImpl";

export declare namespace TypeSchemaContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
    }
}

export class TypeSchemaContextImpl extends BaseContextImpl implements TypeSchemaContext {
    public readonly type: TypeContextMixinImpl;
    public readonly typeSchema: TypeSchemaContextMixinImpl;

    constructor({
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaDeclarationReferencer,
        typeSchemaGenerator,
        typeGenerator,
        ...superInit
    }: TypeSchemaContextImpl.Init) {
        super(superInit);
        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeResolver,
            typeGenerator,
            typeDeclarationReferencer,
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
    }
}
