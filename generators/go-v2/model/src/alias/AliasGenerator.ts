import { GoFile } from "@fern-api/go-base";
import { go } from "@fern-api/go-ast";

import { AliasTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { AbstractModelGenerator } from "../AbstractModelGenerator";

export class AliasGenerator extends AbstractModelGenerator {
    private readonly aliasType: go.Type;

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly aliasDeclaration: AliasTypeDeclaration
    ) {
        super(context, typeDeclaration);
        this.aliasType = this.context.goTypeMapper.convert({ reference: this.aliasDeclaration.aliasOf });
    }

    protected doGenerate(): GoFile {
        const alias = go.alias({
            name: this.typeReference.name,
            type: this.aliasType,
            docs: this.typeDeclaration.docs
        });
        return this.toFile(alias);
    }
}
