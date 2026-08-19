import { swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export declare namespace AliasGenerator {
    interface Args {
        name: string;
        typeDeclaration: FernIr.AliasTypeDeclaration;
        docsContent?: string;
        context: ModelGeneratorContext;
    }
}

export class AliasGenerator {
    private readonly name: string;
    private readonly typeDeclaration: FernIr.AliasTypeDeclaration;
    private readonly docsContent?: string;
    private readonly context: ModelGeneratorContext;

    public constructor({ name, typeDeclaration, docsContent, context }: AliasGenerator.Args) {
        this.name = name;
        this.typeDeclaration = typeDeclaration;
        this.docsContent = docsContent;
        this.context = context;
    }

    public generate(): swift.Statement {
        return this.generateTypealiasDeclarationForTypeDeclaration();
    }

    private generateTypealiasDeclarationForTypeDeclaration(): swift.Statement {
        return swift.Statement.typealiasDeclaration({
            unsafeName: this.name,
            accessLevel: swift.AccessLevel.Public,
            aliasedType: this.context.getSwiftTypeReferenceFromSourceModuleScope(this.typeDeclaration.aliasOf),
            docs: this.docsContent ? swift.docComment({ summary: this.docsContent }) : undefined
        });
    }
}
