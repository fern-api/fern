import { TypeResolver } from "@fern-typescript/resolvers";
import { TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { BaseContextImpl } from "./BaseContextImpl";
import { TypeContextMixinImpl } from "./mixins/TypeContextMixinImpl";

export declare namespace TypeContextImpl {
    export interface Init extends BaseContextImpl.Init {
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
    }
}

export class TypeContextImpl extends BaseContextImpl implements TypeContext {
    public readonly type: TypeContextMixinImpl;

    constructor({ typeResolver, typeDeclarationReferencer, typeGenerator, ...superInit }: TypeContextImpl.Init) {
        super(superInit);
        this.type = new TypeContextMixinImpl({
            sourceFile: this.base.sourceFile,
            importsManager: this.importsManager,
            typeGenerator,
            typeResolver,
            typeDeclarationReferencer,
        });
    }
}
