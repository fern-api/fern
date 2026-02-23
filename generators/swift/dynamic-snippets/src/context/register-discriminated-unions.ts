import { noop, visitDiscriminatedUnion } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { EnumWithAssociatedValues, NameRegistry, swift } from "@fern-api/swift-codegen";
import type { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext.js";

export function registerDiscriminatedUnionVariants({
    parentSymbol,
    registry,
    namedType,
    context
}: {
    parentSymbol: swift.Symbol;
    registry: NameRegistry;
    namedType: FernIr.dynamic.NamedType;
    context: DynamicSnippetsGeneratorContext;
}): Set<string> {
    let standaloneVariantDiscriminantWireValues = new Set<string>();
    visitDiscriminatedUnion(namedType, "type")._visit({
        discriminatedUnion: (utd) => {
            const variants = Object.values(utd.types).map((singleUnionType) => {
                const symbolName = EnumWithAssociatedValues.sanitizeToPascalCase(
                    singleUnionType.discriminantValue.name.pascalCase.unsafeName
                );
                const caseName = EnumWithAssociatedValues.sanitizeToCamelCase(
                    singleUnionType.discriminantValue.name.camelCase.unsafeName
                );
                if (singleUnionType.type === "samePropertiesAsObject") {
                    const variantProperties = context.getPropertiesOfDiscriminatedUnionVariant(singleUnionType.typeId);
                    const standaloneTypeIncludesDiscriminant = variantProperties.some(
                        (p) => p.name.wireValue === utd.discriminant.wireValue
                    );
                    if (standaloneTypeIncludesDiscriminant) {
                        standaloneVariantDiscriminantWireValues.add(singleUnionType.discriminantValue.wireValue);
                    }
                }
                return {
                    swiftType: swift.TypeReference.symbol(symbolName),
                    caseName: caseName,
                    symbolName,
                    discriminantWireValue: singleUnionType.discriminantValue.wireValue,
                    docsContent: undefined
                };
            });
            registry.registerDiscriminatedUnionVariants({
                parentSymbol,
                variants,
                standaloneVariantDiscriminantWireValues
            });
        },
        alias: noop,
        enum: noop,
        object: noop,
        undiscriminatedUnion: noop,
        _other: noop
    });
    return standaloneVariantDiscriminantWireValues;
}
