import { noop } from "@fern-api/core-utils";
import { BaseSwiftCustomConfigSchema, swift } from "@fern-api/swift-codegen";
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
    typeDeclaration.shape._visit({
        union: (utd) => {
            const variants = utd.types.map((singleUnionType) => {
                return {
                    swiftType: swift.TypeReference.symbol(singleUnionType.discriminantValue.name.pascalCase.unsafeName),
                    caseName: singleUnionType.discriminantValue.name.camelCase.unsafeName,
                    symbolName: singleUnionType.discriminantValue.name.pascalCase.unsafeName,
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
