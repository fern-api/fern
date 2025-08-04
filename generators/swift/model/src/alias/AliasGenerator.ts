import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";
import { AliasTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { getSwiftTypeForTypeReference } from "../converters";

export class AliasGenerator {
    private readonly name: string;
    private readonly directory: RelativeFilePath;
    private readonly typeDeclaration: AliasTypeDeclaration;

    public constructor(name: string, directory: RelativeFilePath, typeDeclaration: AliasTypeDeclaration) {
        this.name = name;
        this.directory = directory;
        this.typeDeclaration = typeDeclaration;
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
            aliasedType: getSwiftTypeForTypeReference(this.typeDeclaration.aliasOf)
        });
    }
}
