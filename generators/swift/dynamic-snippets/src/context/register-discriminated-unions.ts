import { noop, visitDiscriminatedUnion } from "@fern-api/core-utils";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { EnumWithAssociatedValues, NameRegistry, swift } from "@fern-api/swift-codegen";

export function registerDiscriminatedUnionVariants({
    parentSymbol,
    registry,
    namedType
}: {
    parentSymbol: swift.Symbol;
    registry: NameRegistry;
    namedType: FernIr.dynamic.NamedType;
}) {
    visitDiscriminatedUnion(namedType, "type")._visit({
        discriminatedUnion: (utd) => {
            const variants = Object.values(utd.types).map((singleUnionType) => {
                const symbolName = EnumWithAssociatedValues.sanitizeToPascalCase(
                    singleUnionType.discriminantValue.name.pascalCase.unsafeName
                );
                const caseName = EnumWithAssociatedValues.sanitizeToCamelCase(
                    singleUnionType.discriminantValue.name.camelCase.unsafeName
                );
                return {
                    swiftType: swift.TypeReference.symbol(symbolName),
                    caseName: caseName,
                    symbolName,
                    discriminantWireValue: singleUnionType.discriminantValue.wireValue,
                    docsContent: undefined
                };
            });
            registry.registerDiscriminatedUnionVariants({ parentSymbol, variants });
        },
        alias: noop,
        enum: noop,
        object: noop,
        undiscriminatedUnion: noop,
        _other: noop
    });
}
