import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

export class StringEnumGenerator {
    private readonly name: string;
    private readonly directory: RelativeFilePath;
    private readonly typeDeclaration: TypeDeclaration;
    private readonly enumTypeDeclaration: EnumTypeDeclaration;

    public constructor(
        name: string,
        directory: RelativeFilePath,
        typeDeclaration: TypeDeclaration,
        enumTypeDeclaration: EnumTypeDeclaration
    ) {
        this.name = name;
        this.directory = directory;
        this.typeDeclaration = typeDeclaration;
        this.enumTypeDeclaration = enumTypeDeclaration;
    }

    private get filename(): string {
        return this.name + ".swift";
    }

    public generate(): SwiftFile {
        const swiftEnum = this.generateEnumForTypeDeclaration();
        const fileContents = swiftEnum.toString();
        return new SwiftFile({
            filename: this.filename,
            directory: this.directory,
            fileContents
        });
    }

    private generateEnumForTypeDeclaration(): swift.EnumWithRawValues {
        return swift.enumWithRawValues({
            name: this.typeDeclaration.name.name.pascalCase.unsafeName,
            accessLevel: swift.AccessLevel.Public,
            conformances: [
                "String",
                swift.Protocol.Codable,
                swift.Protocol.Hashable,
                swift.Protocol.CaseIterable,
                swift.Protocol.Sendable
            ],
            cases: this.enumTypeDeclaration.values.map((val) => ({
                unsafeName: val.name.name.camelCase.unsafeName,
                rawValue: val.name.wireValue
            }))
        });
    }
}
