import { BaseSwiftCustomConfigSchema, NameRegistry, swift, UndiscriminatedUnion } from "@fern-api/swift-codegen";
import { TypeDeclaration } from "@fern-fern/ir-sdk/api";
import type { AbstractSwiftGeneratorContext } from ".";

export function registerUndiscriminatedUnionVariants({
    parentSymbol,
    registry,
    typeDeclaration,
    context
}: {
    parentSymbol: swift.Symbol;
    registry: NameRegistry;
    typeDeclaration: TypeDeclaration;
    context: AbstractSwiftGeneratorContext<BaseSwiftCustomConfigSchema>;
}) {
    if (typeDeclaration.shape.type === "undiscriminatedUnion") {
        const members = typeDeclaration.shape.members.map((member) => {
            const swiftType = context.getSwiftTypeReferenceFromScope(member.type, parentSymbol);
            return {
                swiftType,
                caseName: UndiscriminatedUnion.inferCaseNameForTypeReference(parentSymbol, swiftType, registry),
                docsContent: member.docs
            };
        });
        registry.registerUndiscriminatedUnionVariants({ parentSymbol, variants: members });
    }
}
