import { go } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";

import { AliasTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { AbstractModelGenerator } from "../AbstractModelGenerator";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

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
