import { go } from "@fern-api/go-ast";
import { GoFile } from "@fern-api/go-base";
import { FernIr } from "@fern-fern/ir-sdk";

import { AbstractModelGenerator } from "../AbstractModelGenerator.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export class AliasGenerator extends AbstractModelGenerator {
    private readonly aliasType: go.Type;

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: FernIr.TypeDeclaration,
        private readonly aliasDeclaration: FernIr.AliasTypeDeclaration
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
