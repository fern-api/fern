import { noop, visitDiscriminatedUnion } from "@fern-api/core-utils";
import { BaseSwiftCustomConfigSchema, EnumWithAssociatedValues, swift } from "@fern-api/swift-codegen";
import { TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { NameRegistry } from "../project";
import type { AbstractSwiftGeneratorContext } from ".";

export function registerDiscriminatedUnionVariants({
    parentSymbol,
    registry,
    typeDeclaration
}: {
    parentSymbol: swift.Symbol;
    registry: NameRegistry;
    typeDeclaration: TypeDeclaration;
    context: AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>;
}) {
    visitDiscriminatedUnion(typeDeclaration.shape)._visit({
        union: (utd) => {
            const variants = utd.types.map((singleUnionType) => {
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
                    docsContent: singleUnionType.docs
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
