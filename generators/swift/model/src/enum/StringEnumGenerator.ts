import { type CaseConverter, getWireValue } from "@fern-api/base-generator";
import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import { swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

export declare namespace StringEnumGenerator {
    type Source =
        | {
              type: "ir";
              enumTypeDeclaration: FernIr.EnumTypeDeclaration;
              caseConverter: CaseConverter;
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
        /** Decode values the API adds later into an `__unknown(String)` case instead of failing. */
        forwardCompatible?: boolean;
    }
}

export class StringEnumGenerator {
    private readonly name: string;
    private readonly source: StringEnumGenerator.Source;
    private readonly docsContent?: string;
    private readonly forwardCompatible: boolean;

    public constructor({ name, source, docsContent, forwardCompatible }: StringEnumGenerator.Args) {
        this.name = name;
        this.source = source;
        this.docsContent = docsContent;
        this.forwardCompatible = forwardCompatible ?? false;
    }

    public generate(): swift.EnumWithRawValues {
        return this.generateEnumForTypeDeclaration();
    }

    private generateEnumForTypeDeclaration(): swift.EnumWithRawValues {
        return swift.enumWithRawValues({
            name: this.name,
            accessLevel: swift.AccessLevel.Public,
            conformances: [
                this.forwardCompatible ? swift.Protocol.RawRepresentable : "String",
                swift.Protocol.Codable,
                swift.Protocol.Hashable,
                swift.Protocol.CaseIterable,
                swift.Protocol.Sendable
            ],
            cases: visitDiscriminatedUnion(this.source, "type")._visit({
                ir: (info) => {
                    return info.enumTypeDeclaration.values.map((val) => ({
                        unsafeName: info.caseConverter.camelUnsafe(val.name),
                        rawValue: getWireValue(val.name),
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
            unknownCase: this.forwardCompatible
                ? {
                      unsafeName: "__unknown",
                      docs: swift.docComment({
                          summary:
                              "A value this version of the SDK does not recognize, such as one the API added later."
                      })
                  }
                : undefined,
            docs: this.docsContent ? swift.docComment({ summary: this.docsContent }) : undefined
        });
    }
}
