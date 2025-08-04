import { swift } from "@fern-api/swift-codegen";
import { AliasTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace AliasGenerator {
    interface Args {
        name: string;
        typeDeclaration: AliasTypeDeclaration;
        context: ModelGeneratorContext;
    }
}

export class AliasGenerator {
    private readonly name: string;
    private readonly typeDeclaration: AliasTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor({ name, typeDeclaration, context }: AliasGenerator.Args) {
        this.name = name;
        this.typeDeclaration = typeDeclaration;
        this.context = context;
    }

    public generate(): swift.Statement {
        return this.generateTypealiasDeclarationForTypeDeclaration();
    }

    private generateTypealiasDeclarationForTypeDeclaration(): swift.Statement {
        return swift.Statement.typealiasDeclaration({
            unsafeName: this.name,
            accessLevel: swift.AccessLevel.Public,
            aliasedType: this.context.getSwiftTypeForTypeReference(this.typeDeclaration.aliasOf)
        });
    }
}
