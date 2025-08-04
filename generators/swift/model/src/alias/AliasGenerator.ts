import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { AliasTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

export declare namespace AliasGenerator {
    interface Args {
        name: string;
        directory: RelativeFilePath;
        typeDeclaration: AliasTypeDeclaration;
        context: ModelGeneratorContext;
    }
}

export class AliasGenerator {
    private readonly name: string;
    private readonly directory: RelativeFilePath;
    private readonly typeDeclaration: AliasTypeDeclaration;
    private readonly context: ModelGeneratorContext;

    public constructor({ name, directory, typeDeclaration, context }: AliasGenerator.Args) {
        this.name = name;
        this.directory = directory;
        this.typeDeclaration = typeDeclaration;
        this.context = context;
    }

    private get filename(): string {
        return this.name + ".swift";
    }

    public generate(): SwiftFile {
        const statement = this.generateTypealiasDeclarationForTypeDeclaration();
        return new SwiftFile({
            filename: this.filename,
            directory: this.directory,
            fileContents: [statement]
        });
    }

    private generateTypealiasDeclarationForTypeDeclaration(): swift.Statement {
        return swift.Statement.typealiasDeclaration({
            unsafeName: this.name,
            accessLevel: swift.AccessLevel.Public,
            aliasedType: this.context.getSwiftTypeForTypeReference(this.typeDeclaration.aliasOf)
        });
    }
}
