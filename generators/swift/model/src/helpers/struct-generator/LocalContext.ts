import { noop } from "@fern-api/core-utils";
import { LiteralEnum, swift } from "@fern-api/swift-codegen";
import { TypeReference } from "@fern-fern/ir-sdk/api";

import { LiteralEnumGenerator } from "../../literal";
import { LocalSymbolRegistry } from "./LocalSymbolRegistry";
import type { StructGenerator } from "./StructGenerator";

export declare namespace LocalContext {
    interface AdditionalPropertiesMetadata {
        /**
         * The name of the property that will be used to store additional properties that are not explicitly defined in the schema.
         */
        propertyName: string;
        swiftType: swift.TypeReference;
    }

    interface Args {
        readonly additionalPropertiesMetadata?: AdditionalPropertiesMetadata;
        readonly stringLiteralEnums: Map<string, swift.EnumWithRawValues>;
        readonly symbolRegistry: LocalSymbolRegistry;
    }
}

export class LocalContext {
    public readonly additionalPropertiesMetadata?: LocalContext.AdditionalPropertiesMetadata;
    public readonly stringLiteralEnums: Map<string, swift.EnumWithRawValues>;
    public readonly symbolRegistry: LocalSymbolRegistry;

    public static buildForStructGenerator(args: StructGenerator.Args): LocalContext {
        const {
            constantPropertyDefinitions,
            dataPropertyDefinitions,
            additionalProperties: hasAdditionalProperties
        } = args;
        const symbolRegistry = LocalSymbolRegistry.create();

        const computeAdditionalPropertiesMetadata = () => {
            const otherPropertyNames = [
                ...constantPropertyDefinitions.map((p) => p.unsafeName),
                ...dataPropertyDefinitions.map((p) => p.unsafeName)
            ];
            const otherPropertyNamesSet = new Set(otherPropertyNames);
            let propertyName = "additionalProperties";
            while (otherPropertyNamesSet.has(propertyName)) {
                propertyName = "_" + propertyName;
            }
            return {
                propertyName,
                swiftType: swift.TypeReference.dictionary(
                    // TODO(kafkas): These should not be unqualified
                    swift.TypeReference.unqualifiedToSwiftType("String"),
                    swift.TypeReference.unqualifiedToSwiftType("Any")
                )
            };
        };

        const generateStringLiteralEnums = (): Map<string, swift.EnumWithRawValues> => {
            const enumsByLiteralValue = new Map<string, swift.EnumWithRawValues>();

            const generateStringLiteralEnumsForTypeReference = (typeReference: TypeReference) => {
                typeReference._visit({
                    container: (container) => {
                        container._visit({
                            literal: (literal) => {
                                literal._visit({
                                    string: (literalValue) => {
                                        const enumName = symbolRegistry.registerStringLiteralSymbolIfNotExists(
                                            LiteralEnum.generateName(literalValue),
                                            literalValue
                                        );
                                        const literalEnumGenerator = new LiteralEnumGenerator({
                                            name: enumName,
                                            literalValue
                                        });
                                        enumsByLiteralValue.set(literalValue, literalEnumGenerator.generate());
                                    },
                                    boolean: noop,
                                    _other: noop
                                });
                            },
                            map: (mapType) => {
                                generateStringLiteralEnumsForTypeReference(mapType.keyType);
                                generateStringLiteralEnumsForTypeReference(mapType.valueType);
                            },
                            set: (ref) => {
                                generateStringLiteralEnumsForTypeReference(ref);
                            },
                            nullable: (ref) => {
                                generateStringLiteralEnumsForTypeReference(ref);
                            },
                            optional: (ref) => {
                                generateStringLiteralEnumsForTypeReference(ref);
                            },
                            list: (ref) => {
                                generateStringLiteralEnumsForTypeReference(ref);
                            },
                            _other: noop
                        });
                    },
                    primitive: noop,
                    unknown: noop,
                    named: noop,
                    _other: noop
                });
            };

            for (const def of [...constantPropertyDefinitions, ...dataPropertyDefinitions]) {
                if (def.type instanceof swift.TypeReference) {
                    continue;
                }
                generateStringLiteralEnumsForTypeReference(def.type);
            }

            return enumsByLiteralValue;
        };

        return new LocalContext({
            additionalPropertiesMetadata: hasAdditionalProperties ? computeAdditionalPropertiesMetadata() : undefined,
            stringLiteralEnums: generateStringLiteralEnums(),
            symbolRegistry
        });
    }

    private constructor(args: LocalContext.Args) {
        this.additionalPropertiesMetadata = args.additionalPropertiesMetadata;
        this.stringLiteralEnums = args.stringLiteralEnums;
        this.symbolRegistry = args.symbolRegistry;
    }

    // TODO(kafkas): Scrap this. Pull from name registry.
    public getSwiftTypeForStringLiteral(literalValue: string): swift.TypeReference {
        const enumName = this.symbolRegistry.getStringLiteralSymbolOrThrow(literalValue);
        return swift.TypeReference.symbol(enumName);
    }

    public hasNestedTypeWithName(symbolName: string): boolean {
        return Array.from(this.stringLiteralEnums.values()).some((enum_) => enum_.name === symbolName);
    }
}
