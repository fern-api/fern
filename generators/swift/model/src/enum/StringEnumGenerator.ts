import { swift } from "@fern-api/swift-codegen";

import { EnumTypeDeclaration } from "@fern-fern/ir-sdk/api";

export declare namespace StringEnumGenerator {
    interface Args {
        name: string;
        enumTypeDeclaration: EnumTypeDeclaration;
        docsContent?: string;
    }
}

export class StringEnumGenerator {
    private readonly name: string;
    private readonly enumTypeDeclaration: EnumTypeDeclaration;
    private readonly docsContent?: string;

    public constructor({ name, enumTypeDeclaration, docsContent }: StringEnumGenerator.Args) {
        this.name = name;
        this.enumTypeDeclaration = enumTypeDeclaration;
        this.docsContent = docsContent;
    }

    public generate(): swift.EnumWithRawValues {
        return this.generateEnumForTypeDeclaration();
    }

    private generateEnumForTypeDeclaration(): swift.EnumWithRawValues {
        return swift.enumWithRawValues({
            name: this.name,
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
                rawValue: val.name.wireValue,
                docs: val.docs ? swift.docComment({ summary: val.docs }) : undefined
            })),
            docs: this.docsContent ? swift.docComment({ summary: this.docsContent }) : undefined
        });
    }
}
