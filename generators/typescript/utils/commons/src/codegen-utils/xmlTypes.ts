import { assertNever } from "@fern-api/core-utils";
import { FernIr } from "@fern-fern/ir-sdk";

export type GetTypeDeclaration = (typeName: FernIr.DeclaredTypeName) => FernIr.TypeDeclaration;

export function getXmlEncoding(typeDeclaration: FernIr.TypeDeclaration): FernIr.XmlEncoding | undefined {
    return typeDeclaration.shape.type === "object" ? typeDeclaration.encoding?.xml : undefined;
}

export function getXmlPropertyKind(property: FernIr.ObjectProperty): FernIr.XmlPropertyKind {
    return property.xml?.kind ?? "ELEMENT";
}

export interface XmlValueShape {
    /** The element type for lists/sets, otherwise the (non-optional) type itself. */
    itemType: FernIr.TypeReference;
    isList: boolean;
    /** The property may be omitted (`optional<T>`). */
    isOptional: boolean;
    /** The property may hold `null` (`nullable<T>`); does not by itself make it optional. */
    isNullable: boolean;
}

/**
 * Peels optional/nullable/list/set containers (and aliases to them) off a property type so
 * XML code generation can decide between scalar, list and child-element handling.
 */
export function getXmlValueShape(
    typeReference: FernIr.TypeReference,
    getTypeDeclaration: GetTypeDeclaration
): XmlValueShape {
    let current = typeReference;
    let isOptional = false;
    let isNullable = false;
    let isList = false;
    for (;;) {
        switch (current.type) {
            case "container": {
                const container = current.container;
                switch (container.type) {
                    case "optional":
                        isOptional = true;
                        current = container.optional;
                        continue;
                    case "nullable":
                        isNullable = true;
                        current = container.nullable;
                        continue;
                    case "list":
                        isList = true;
                        current = container.list;
                        continue;
                    case "set":
                        isList = true;
                        current = container.set;
                        continue;
                    case "map":
                    case "literal":
                        return { itemType: current, isList, isOptional, isNullable };
                    default:
                        assertNever(container);
                }
                break;
            }
            case "named": {
                const declaration = getTypeDeclaration(current);
                if (declaration.shape.type === "alias") {
                    current = declaration.shape.aliasOf;
                    continue;
                }
                return { itemType: current, isList, isOptional, isNullable };
            }
            case "primitive":
            case "unknown":
                return { itemType: current, isList, isOptional, isNullable };
            default:
                assertNever(current);
        }
    }
}

/**
 * Returns the xml-encoded object types a value of this type can hold, following aliases and
 * undiscriminated union members. Empty for scalar values.
 */
export function getXmlChildObjectTypes(
    typeReference: FernIr.TypeReference,
    getTypeDeclaration: GetTypeDeclaration
): FernIr.TypeDeclaration[] {
    const result: FernIr.TypeDeclaration[] = [];
    const seen = new Set<FernIr.TypeId>();
    const visit = (reference: FernIr.TypeReference): void => {
        if (reference.type !== "named" || seen.has(reference.typeId)) {
            return;
        }
        seen.add(reference.typeId);
        const declaration = getTypeDeclaration(reference);
        switch (declaration.shape.type) {
            case "object":
                if (getXmlEncoding(declaration) != null) {
                    result.push(declaration);
                }
                return;
            case "alias":
                visit(declaration.shape.aliasOf);
                return;
            case "undiscriminatedUnion":
                for (const member of declaration.shape.members) {
                    visit(member.type);
                }
                return;
            case "enum":
            case "union":
                return;
            default:
                assertNever(declaration.shape);
        }
    };
    visit(getXmlValueShape(typeReference, getTypeDeclaration).itemType);
    return result;
}

/**
 * Type ids of xml-encoded objects that appear as child elements of another xml-encoded object.
 * Any xml-encoded object not in this set is a document root.
 */
export function getXmlChildTypeIds(
    types: Iterable<FernIr.TypeDeclaration>,
    getTypeDeclaration: GetTypeDeclaration
): Set<FernIr.TypeId> {
    const childTypeIds = new Set<FernIr.TypeId>();
    for (const type of types) {
        if (type.shape.type !== "object" || getXmlEncoding(type) == null) {
            continue;
        }
        for (const property of type.shape.properties) {
            if (getXmlPropertyKind(property) !== "ELEMENT") {
                continue;
            }
            for (const child of getXmlChildObjectTypes(property.valueType, getTypeDeclaration)) {
                childTypeIds.add(child.name.typeId);
            }
        }
    }
    return childTypeIds;
}

/**
 * Whether a type is xml-encoded or (transitively) references an xml-encoded type. Such types
 * are carried by generated xml classes rather than plain interfaces, so no json schema is
 * generated for them.
 */
export function isXmlDependentType(
    typeDeclaration: FernIr.TypeDeclaration,
    getTypeDeclarationById: (typeId: FernIr.TypeId) => FernIr.TypeDeclaration
): boolean {
    if (getXmlEncoding(typeDeclaration) != null) {
        return true;
    }
    for (const typeId of typeDeclaration.referencedTypes) {
        if (getXmlEncoding(getTypeDeclarationById(typeId)) != null) {
            return true;
        }
    }
    return false;
}
