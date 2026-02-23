import { noop } from "@fern-api/core-utils";
import { BaseSwiftCustomConfigSchema, EnumWithAssociatedValues, NameRegistry, swift } from "@fern-api/swift-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import type { AbstractSwiftGeneratorContext } from "./index.js";

export function registerDiscriminatedUnionVariants({
    parentSymbol,
    registry,
    typeDeclaration,
    context
}: {
    parentSymbol: swift.Symbol;
    registry: NameRegistry;
    typeDeclaration: FernIr.TypeDeclaration;
    context: AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>;
}): Set<string> {
    let standaloneVariantDiscriminantWireValues = new Set<string>();
    typeDeclaration.shape._visit({
        union: (utd) => {
            const variants = utd.types.map((singleUnionType) => {
                const symbolName = EnumWithAssociatedValues.sanitizeToPascalCase(
                    singleUnionType.discriminantValue.name.pascalCase.unsafeName
                );
                const caseName = EnumWithAssociatedValues.sanitizeToCamelCase(
                    singleUnionType.discriminantValue.name.camelCase.unsafeName
                );
                if (singleUnionType.shape.propertiesType === "samePropertiesAsObject") {
                    const variantProperties = context.getPropertiesOfDiscriminatedUnionVariant(
                        singleUnionType.shape.typeId
                    );
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
                    docsContent: singleUnionType.docs
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
