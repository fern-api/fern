import { assertNever, assertNonNull } from "@fern-api/core-utils";
import { BaseSwiftCustomConfigSchema, NameRegistry, swift } from "@fern-api/swift-codegen";
import { TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { camelCase, upperFirst } from "lodash-es";
import type { AbstractSwiftGeneratorContext } from ".";

const CASE_LABELS_BY_SWIFT_SYMBOL_NAME: Record<swift.SwiftTypeSymbolName, string> = {
    String: "string",
    Bool: "bool",
    Int: "int",
    Int64: "int64",
    UInt: "uint",
    UInt64: "uint64",
    Float: "float",
    Double: "double",
    Void: "void",
    Encoder: "encoder",
    Decoder: "decoder",
    Any: "any"
};

const CASE_LABELS_BY_FOUNDATION_SYMBOL_NAME: Record<swift.FoundationTypeSymbolName, string> = {
    Data: "data",
    Date: "date",
    URLSession: "urlSession",
    UUID: "uuid"
};

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
                caseName: inferCaseNameForTypeReference(parentSymbol, swiftType, registry),
                docsContent: member.docs
            };
        });
        registry.registerUndiscriminatedUnionVariants({ parentSymbol, variants: members });
    }
}

export function inferCaseNameForTypeReference(
    parentSymbol: swift.Symbol,
    typeReference: swift.TypeReference,
    registry: NameRegistry
): string {
    if (typeReference.variant.type === "symbol") {
        const symbolRef = typeReference.variant.symbol;
        const symbol = registry.resolveReference({ fromSymbol: parentSymbol, reference: symbolRef });
        assertNonNull(symbol, `Cannot find symbol ${symbolRef} for type reference ${typeReference.variant.type}`);
        const symbolName = symbol.name;
        if (swift.Symbol.isSwiftSymbol(symbol.id) && swift.Symbol.isSwiftSymbolName(symbolName)) {
            return CASE_LABELS_BY_SWIFT_SYMBOL_NAME[symbolName];
        } else if (swift.Symbol.isFoundationSymbol(symbol.id) && swift.Symbol.isFoundationSymbolName(symbolName)) {
            return CASE_LABELS_BY_FOUNDATION_SYMBOL_NAME[symbolName];
        } else {
            return camelCase(symbolName);
        }
    } else if (typeReference.variant.type === "generic") {
        const argumentTypeCaseNames = typeReference.variant.arguments.map((argument) =>
            inferCaseNameForTypeReference(parentSymbol, argument, registry)
        );
        return `${inferCaseNameForTypeReference(parentSymbol, typeReference.variant.reference, registry)}Of${upperFirst(argumentTypeCaseNames.join("And"))}`;
    } else if (typeReference.variant.type === "array") {
        const elementTypeCaseName = inferCaseNameForTypeReference(
            parentSymbol,
            typeReference.variant.elementType,
            registry
        );
        return `${elementTypeCaseName}Array`;
    } else if (typeReference.variant.type === "dictionary") {
        const keyTypeCaseName = inferCaseNameForTypeReference(parentSymbol, typeReference.variant.keyType, registry);
        const valueTypeCaseName = inferCaseNameForTypeReference(
            parentSymbol,
            typeReference.variant.valueType,
            registry
        );
        return `${keyTypeCaseName}To${upperFirst(valueTypeCaseName)}Dictionary`;
    } else if (typeReference.variant.type === "optional") {
        const valueTypeCaseName = inferCaseNameForTypeReference(
            parentSymbol,
            typeReference.variant.valueType,
            registry
        );
        return `optional${upperFirst(valueTypeCaseName)}`;
    } else if (typeReference.variant.type === "nullable") {
        const valueTypeCaseName = inferCaseNameForTypeReference(
            parentSymbol,
            typeReference.variant.valueType,
            registry
        );
        return `nullable${upperFirst(valueTypeCaseName)}`;
    } else if (typeReference.variant.type === "tuple") {
        const memberTypeCaseNames = typeReference.variant.elements.map((element) =>
            inferCaseNameForTypeReference(parentSymbol, element, registry)
        );
        return `tuple${upperFirst(memberTypeCaseNames.join("And"))}`;
    } else if (typeReference.variant.type === "member-access") {
        const targetTypeCaseName = inferCaseNameForTypeReference(parentSymbol, typeReference.variant.target, registry);
        return `${targetTypeCaseName}${upperFirst(typeReference.variant.memberName)}`;
    } else {
        assertNever(typeReference.variant);
    }
}
