import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";

import { EnumTypeDeclaration } from "@fern-fern/ir-sdk/api";

export declare namespace StringEnumGenerator {
    type Source =
        | {
              type: "ir";
              enumTypeDeclaration: EnumTypeDeclaration;
          }
        | {
              type: "custom";
              values: {
                  unsafeName: string;
                  rawValue: string;
                  docsContent?: string;
              }[];
          };

    interface Args {
        name: string;
        source: Source;
        docsContent?: string;
    }
}

export class StringEnumGenerator {
    private readonly name: string;
    private readonly source: StringEnumGenerator.Source;
    private readonly docsContent?: string;

    public constructor({ name, source, docsContent }: StringEnumGenerator.Args) {
        this.name = name;
        this.source = source;
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
            cases: visitDiscriminatedUnion(this.source, "type")._visit({
                ir: (info) => {
                    return info.enumTypeDeclaration.values.map((val) => ({
                        unsafeName: val.name.name.camelCase.unsafeName,
                        rawValue: val.name.wireValue,
                        docs: val.docs ? swift.docComment({ summary: val.docs }) : undefined
                    }));
                },
                custom: (info) => {
                    return info.values.map((val) => ({
                        unsafeName: val.unsafeName,
                        rawValue: val.rawValue,
                        docs: val.docsContent ? swift.docComment({ summary: val.docsContent }) : undefined
                    }));
                }
            }),
            docs: this.docsContent ? swift.docComment({ summary: this.docsContent }) : undefined
        });
    }
}
