import { RelativeFilePath } from "@fern-api/fs-utils";
import { SwiftFile } from "@fern-api/swift-base";
import { swift } from "@fern-api/swift-codegen";

import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

export class StringEnumGenerator {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly enumTypeDeclaration: EnumTypeDeclaration;

    public constructor(typeDeclaration: TypeDeclaration, enumTypeDeclaration: EnumTypeDeclaration) {
        this.typeDeclaration = typeDeclaration;
        this.enumTypeDeclaration = enumTypeDeclaration;
    }

    public generate(): SwiftFile {
        const swiftEnum = this.generateEnumForTypeDeclaration();
        const fileContents = swiftEnum.toString();
        return new SwiftFile({
            filename: this.getFilename(),
            directory: this.getFileDirectory(),
            fileContents
        });
    }

    private getFilename(): string {
        // TODO(kafkas): File names need to be unique across the generated output so we'll need to validate this
        return this.typeDeclaration.name.name.pascalCase.unsafeName + ".swift";
    }

    private getFileDirectory(): RelativeFilePath {
        return RelativeFilePath.of("Schemas");
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
