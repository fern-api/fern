import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { NameRegistry, swift, UndiscriminatedUnion } from "@fern-api/swift-codegen";
import type { DynamicSnippetsGeneratorContext } from "./DynamicSnippetsGeneratorContext";

export function registerUndiscriminatedUnionVariants({
    parentSymbol,
    registry,
    namedType,
    context
}: {
    parentSymbol: swift.Symbol;
    registry: NameRegistry;
    namedType: FernIr.dynamic.NamedType;
    context: DynamicSnippetsGeneratorContext;
}) {
    if (namedType.type === "undiscriminatedUnion") {
        const members = namedType.types.map((typeReference) => {
            const swiftType = context.getSwiftTypeReferenceFromScope(typeReference, parentSymbol);
            return {
                swiftType,
                caseName: UndiscriminatedUnion.inferCaseNameForTypeReference(parentSymbol, swiftType, registry),
                docsContent: undefined
            };
        });
        registry.registerUndiscriminatedUnionVariants({ parentSymbol, variants: members });
    }
}
