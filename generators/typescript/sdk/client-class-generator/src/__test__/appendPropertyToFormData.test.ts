import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    caseConverter,
    casingsGenerator,
    createInlinedRequestBodyProperty,
    createNameAndWireValue
} from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";
import { appendPropertyToFormData } from "../endpoints/utils/appendPropertyToFormData.js";

const STRING_TYPE = FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });
const OPTIONAL_STRING_TYPE = FernIr.TypeReference.container(FernIr.ContainerType.optional(STRING_TYPE));
const LIST_STRING_TYPE = FernIr.TypeReference.container(FernIr.ContainerType.list(STRING_TYPE));
const SET_STRING_TYPE = FernIr.TypeReference.container(FernIr.ContainerType.set(STRING_TYPE));
const UNKNOWN_TYPE = FernIr.TypeReference.unknown();

// biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
function createMockContext(): any {
    return {
        includeSerdeLayer: true,
        retainOriginalCasing: false,
        inlineFileProperties: false,
        type: {
            stringify: (expr: ts.Expression) =>
                ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(expr, "toString"),
                    undefined,
                    []
                ),
            resolveTypeReference: (typeRef: FernIr.TypeReference) => typeRef,
            getTypeDeclaration: () => ({
                shape: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            }),
            getReferenceToType: (typeRef: FernIr.TypeReference) => {
                const isOptional =
                    typeRef.type === "container" &&
                    (typeRef.container.type === "optional" || typeRef.container.type === "nullable");
                return { isOptional };
            }
        },
        coreUtilities: {
            formDataUtils: {
                appendFile: ({
                    key,
                    value
                }: {
                    referenceToFormData: ts.Expression;
                    key: string;
                    value: ts.Expression;
                }) =>
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier("_body"),
                                "appendFile"
                            ),
                            undefined,
                            [ts.factory.createStringLiteral(key), value]
                        )
                    ),
                append: ({
                    key,
                    value
                }: {
                    referenceToFormData: ts.Expression;
                    key: string | ts.Expression;
                    value: ts.Expression;
                }) =>
                    ts.factory.createExpressionStatement(
                        ts.factory.createCallExpression(
                            ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("_body"), "append"),
                            undefined,
                            [typeof key === "string" ? ts.factory.createStringLiteral(key) : key, value]
                        )
                    ),
                encodeAsFormParameter: ({ referenceToArgument }: { referenceToArgument: ts.Expression }) =>
                    ts.factory.createCallExpression(
                        ts.factory.createIdentifier("core.encodeAsFormParameter"),
                        undefined,
                        [referenceToArgument]
                    )
            }
        },
        jsonContext: {
            getReferenceToToJson: () => ({
                getExpression: () => ts.factory.createIdentifier("JSON.stringify")
            })
        },
        case: caseConverter
    };
}

function createFileProperty(
    name: string,
    opts?: { isOptional?: boolean; type?: "file" | "fileArray" }
): FernIr.FileUploadRequestProperty {
    const base = {
        key: createNameAndWireValue(name),
        isOptional: opts?.isOptional ?? false,
        contentType: undefined,
        docs: undefined
    };
    const filePropertyValue =
        opts?.type === "fileArray" ? FernIr.FileProperty.fileArray(base) : FernIr.FileProperty.file(base);
    return FernIr.FileUploadRequestProperty.file(filePropertyValue);
}

function createBodyProperty(
    name: string,
    valueType: FernIr.TypeReference,
    style?: "form" | "json"
): FernIr.FileUploadRequestProperty {
    return FernIr.FileUploadRequestProperty.bodyProperty({
        ...createInlinedRequestBodyProperty(name, valueType),
        contentType: undefined,
        style: style ?? undefined
    });
}

// biome-ignore lint/suspicious/noExplicitAny: test mock
function createMockRequestParameter(): any {
    return {
        getReferenceToBodyProperty: (property: FernIr.InlinedRequestBodyProperty) =>
            ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier("request"),
                caseConverter.camelUnsafe(property.name)
            )
    };
}

const referenceToFormData = ts.factory.createIdentifier("_body");

describe("appendPropertyToFormData", () => {
    describe("file properties", () => {
        it("generates appendFile for single file", () => {
            const property = createFileProperty("avatar");
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: undefined,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            expect(getTextOfTsNode(stmt)).toMatchSnapshot();
        });

        it("generates for-of loop for fileArray", () => {
            const property = createFileProperty("files", { type: "fileArray" });
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: undefined,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            expect(getTextOfTsNode(stmt)).toMatchSnapshot();
        });

        it("wraps in null check for optional single file", () => {
            const property = createFileProperty("avatar", { isOptional: true });
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: undefined,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("!= null");
            expect(text).toMatchSnapshot();
        });

        it("wraps in null check for optional fileArray", () => {
            const property = createFileProperty("files", { isOptional: true, type: "fileArray" });
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: undefined,
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("!= null");
            expect(text).toContain("for");
            expect(text).toMatchSnapshot();
        });
    });

    describe("body properties", () => {
        it("generates append with stringify for simple string property", () => {
            const property = createBodyProperty("name", STRING_TYPE);
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            expect(getTextOfTsNode(stmt)).toMatchSnapshot();
        });

        it("wraps in null check for optional body property", () => {
            const property = createBodyProperty("description", OPTIONAL_STRING_TYPE);
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("!= null");
            expect(text).toMatchSnapshot();
        });

        it("generates for-of loop for list body property", () => {
            const property = createBodyProperty("tags", LIST_STRING_TYPE);
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            expect(getTextOfTsNode(stmt)).toMatchSnapshot();
        });

        it("generates for-of loop for set body property", () => {
            const property = createBodyProperty("uniqueTags", SET_STRING_TYPE);
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            expect(getTextOfTsNode(stmt)).toMatchSnapshot();
        });

        it("generates Array.isArray check for unknown type (maybe iterable)", () => {
            const property = createBodyProperty("data", UNKNOWN_TYPE);
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("Array.isArray");
            expect(text).toMatchSnapshot();
        });

        it("generates JSON.stringify for json style body property", () => {
            const property = createBodyProperty("metadata", STRING_TYPE, "json");
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("JSON.stringify");
            expect(text).toMatchSnapshot();
        });

        it("generates Object.entries loop for form style body property", () => {
            const property = createBodyProperty("formData", STRING_TYPE, "form");
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("Object.entries");
            expect(text).toMatchSnapshot();
        });

        it("throws when requestParameter is undefined for body property", () => {
            const property = createBodyProperty("name", STRING_TYPE);
            const context = createMockContext();
            expect(() =>
                appendPropertyToFormData({
                    property,
                    context,
                    referenceToFormData,
                    wrapperName: "request",
                    requestParameter: undefined,
                    includeSerdeLayer: true,
                    allowExtraFields: false,
                    omitUndefined: false
                })
            ).toThrow("Cannot append body property to form data because requestParameter is not defined.");
        });

        it("generates for-of loop for named type aliasing a list", () => {
            const aliasOfList = createNamedType(
                "ListAlias",
                FernIr.Type.alias({
                    aliasOf: LIST_STRING_TYPE,
                    resolvedType: FernIr.ResolvedTypeReference.container(FernIr.ContainerType.list(STRING_TYPE))
                })
            );
            const property = createBodyProperty("items", aliasOfList);
            const context = createMockContextWithDeclarations({
                type_ListAlias: FernIr.Type.alias({
                    aliasOf: LIST_STRING_TYPE,
                    resolvedType: FernIr.ResolvedTypeReference.container(FernIr.ContainerType.list(STRING_TYPE))
                })
            });
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("for");
            expect(text).toMatchSnapshot();
        });

        it("generates for-of loop for named type aliasing a set", () => {
            const aliasOfSet = createNamedType(
                "SetAlias",
                FernIr.Type.alias({
                    aliasOf: SET_STRING_TYPE,
                    resolvedType: FernIr.ResolvedTypeReference.container(FernIr.ContainerType.set(STRING_TYPE))
                })
            );
            const property = createBodyProperty("uniqueItems", aliasOfSet);
            const context = createMockContextWithDeclarations({
                type_SetAlias: FernIr.Type.alias({
                    aliasOf: SET_STRING_TYPE,
                    resolvedType: FernIr.ResolvedTypeReference.container(FernIr.ContainerType.set(STRING_TYPE))
                })
            });
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("for");
            expect(text).toMatchSnapshot();
        });

        it("generates for-of with Array.isArray+instanceof for undiscriminated union with list, set, and non-iterable members", () => {
            // Mix of iterable (list, set) and non-iterable (string) members:
            // isMaybeIterable=true, isDefinitelyIterable=false (not all members iterable)
            // isMaybeList=true (list member), isMaybeSet=true (set member)
            const unionType = createNamedType(
                "MixedUnion",
                FernIr.Type.undiscriminatedUnion({
                    members: [
                        { type: LIST_STRING_TYPE, docs: undefined },
                        { type: SET_STRING_TYPE, docs: undefined },
                        { type: STRING_TYPE, docs: undefined }
                    ]
                })
            );
            const property = createBodyProperty("mixed", unionType);
            const context = createMockContextWithDeclarations({
                type_MixedUnion: FernIr.Type.undiscriminatedUnion({
                    members: [
                        { type: LIST_STRING_TYPE, docs: undefined },
                        { type: SET_STRING_TYPE, docs: undefined },
                        { type: STRING_TYPE, docs: undefined }
                    ]
                })
            });
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("Array.isArray");
            expect(text).toContain("instanceof Set");
            expect(text).toMatchSnapshot();
        });

        it("generates for-of without guard for nullable wrapping a list (definitely iterable=false)", () => {
            const nullableList = FernIr.TypeReference.container(FernIr.ContainerType.nullable(LIST_STRING_TYPE));
            const property = createBodyProperty("nullableTags", nullableList);
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            // nullable wrapping list: isMaybeIterable=true, isDefinitelyIterable=false
            // isMaybeList=false for nullable, isMaybeSet=false for nullable
            // so no guard conditions generated (empty conditions array)
            expect(text).toContain("for");
            expect(text).toMatchSnapshot();
        });

        it("generates for-of for optional wrapping a list (isDefinitelyIterable via optional)", () => {
            const optionalList = FernIr.TypeReference.container(FernIr.ContainerType.optional(LIST_STRING_TYPE));
            const property = createBodyProperty("optionalTags", optionalList);
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            // optional wrapping list: isDefinitelyIterable delegates to inner list → true
            // So no guard condition is needed, just a null check from optional outer type
            expect(text).toContain("!= null");
            expect(text).toMatchSnapshot();
        });

        it("generates for-of with only instanceof Set for undiscriminated union with only set member", () => {
            const unionType = createNamedType(
                "SetOnlyUnion",
                FernIr.Type.undiscriminatedUnion({
                    members: [
                        { type: SET_STRING_TYPE, docs: undefined },
                        { type: STRING_TYPE, docs: undefined }
                    ]
                })
            );
            const property = createBodyProperty("setOrString", unionType);
            const context = createMockContextWithDeclarations({
                type_SetOnlyUnion: FernIr.Type.undiscriminatedUnion({
                    members: [
                        { type: SET_STRING_TYPE, docs: undefined },
                        { type: STRING_TYPE, docs: undefined }
                    ]
                })
            });
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("instanceof Set");
            expect(text).toMatchSnapshot();
        });

        it("generates for-of with only Array.isArray for undiscriminated union with only list member", () => {
            const unionType = createNamedType(
                "ListOnlyUnion",
                FernIr.Type.undiscriminatedUnion({
                    members: [
                        { type: LIST_STRING_TYPE, docs: undefined },
                        { type: STRING_TYPE, docs: undefined }
                    ]
                })
            );
            const property = createBodyProperty("listOrString", unionType);
            const context = createMockContextWithDeclarations({
                type_ListOnlyUnion: FernIr.Type.undiscriminatedUnion({
                    members: [
                        { type: LIST_STRING_TYPE, docs: undefined },
                        { type: STRING_TYPE, docs: undefined }
                    ]
                })
            });
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("Array.isArray");
            expect(text).not.toContain("instanceof Set");
            expect(text).toMatchSnapshot();
        });

        it("generates for-of without guard for undiscriminated union where all members are definitely iterable", () => {
            const unionType = createNamedType(
                "AllIterableUnion",
                FernIr.Type.undiscriminatedUnion({
                    members: [
                        { type: LIST_STRING_TYPE, docs: undefined },
                        { type: SET_STRING_TYPE, docs: undefined }
                    ]
                })
            );
            const property = createBodyProperty("allIterable", unionType);
            const context = createMockContextWithDeclarations({
                type_AllIterableUnion: FernIr.Type.undiscriminatedUnion({
                    members: [
                        { type: LIST_STRING_TYPE, docs: undefined },
                        { type: SET_STRING_TYPE, docs: undefined }
                    ]
                })
            });
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            // All members are definitely iterable, so isDefinitelyIterable=true
            // No guard condition needed
            expect(text).toContain("for");
            expect(text).not.toContain("Array.isArray");
            expect(text).not.toContain("instanceof Set");
            expect(text).toMatchSnapshot();
        });

        it("generates simple append for non-iterable named type (object)", () => {
            const objectType = createNamedType(
                "MyObject",
                FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            );
            const property = createBodyProperty("obj", objectType);
            const context = createMockContextWithDeclarations({
                type_MyObject: FernIr.Type.object({
                    properties: [],
                    extends: [],
                    extraProperties: false,
                    extendedProperties: undefined
                })
            });
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("append");
            expect(text).toContain("toString");
            expect(text).toMatchSnapshot();
        });

        it("generates simple append for enum named type", () => {
            const enumType = createNamedType(
                "MyEnum",
                FernIr.Type.enum({
                    values: [],
                    default: undefined,
                    forwardCompatible: undefined
                })
            );
            const property = createBodyProperty("status", enumType);
            const context = createMockContextWithDeclarations({
                type_MyEnum: FernIr.Type.enum({
                    values: [],
                    default: undefined,
                    forwardCompatible: undefined
                })
            });
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("append");
            expect(text).toMatchSnapshot();
        });

        it("generates simple append for union named type", () => {
            const unionType = createNamedType(
                "MyUnion",
                FernIr.Type.union({
                    discriminant: createNameAndWireValue("type"),
                    extends: [],
                    baseProperties: [],
                    types: [],
                    discriminatorContext: undefined
                })
            );
            const property = createBodyProperty("variant", unionType);
            const context = createMockContextWithDeclarations({
                type_MyUnion: FernIr.Type.union({
                    discriminant: createNameAndWireValue("type"),
                    extends: [],
                    baseProperties: [],
                    types: [],
                    discriminatorContext: undefined
                })
            });
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("append");
            expect(text).toMatchSnapshot();
        });

        it("generates simple append for map container type (not iterable)", () => {
            const mapType = FernIr.TypeReference.container(
                FernIr.ContainerType.map({
                    keyType: STRING_TYPE,
                    valueType: STRING_TYPE
                })
            );
            const property = createBodyProperty("metadata", mapType);
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("append");
            expect(text).toContain("toString");
            expect(text).toMatchSnapshot();
        });

        it("generates Object.entries loop for body property with form style", () => {
            const property = createBodyProperty("metadata", STRING_TYPE, "form");
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            // form style iterates Object.entries with encodeAsFormParameter
            expect(text).toContain("Object.entries");
            expect(text).toContain("core.encodeAsFormParameter");
            expect(text).toMatchSnapshot();
        });

        it("generates JSON.stringify append for body property with json style", () => {
            const property = createBodyProperty("config", STRING_TYPE, "json");
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            // json style uses JSON.stringify
            expect(text).toContain("JSON.stringify");
            expect(text).toMatchSnapshot();
        });

        it("generates for-of loop for unknown type (isMaybeIterable=true, isDefinitelyIterable=false)", () => {
            const property = createBodyProperty("data", UNKNOWN_TYPE);
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            // unknown type: isMaybeIterable=true, isDefinitelyIterable=false
            // isMaybeList=true, isMaybeSet=true (both return true for unknown)
            expect(text).toContain("for");
            expect(text).toMatchSnapshot();
        });

        it("generates simple append for literal container type (not iterable)", () => {
            const literalType = FernIr.TypeReference.container(
                FernIr.ContainerType.literal(FernIr.Literal.string("fixed"))
            );
            const property = createBodyProperty("fixed", literalType);
            const context = createMockContext();
            const stmt = appendPropertyToFormData({
                property,
                context,
                referenceToFormData,
                wrapperName: "request",
                requestParameter: createMockRequestParameter(),
                includeSerdeLayer: true,
                allowExtraFields: false,
                omitUndefined: false
            });
            const text = getTextOfTsNode(stmt);
            expect(text).toContain("append");
            expect(text).toMatchSnapshot();
        });
    });
});

// ── Helpers for named types with custom type declarations ──────────

function createNamedType(name: string, _shape: FernIr.Type): FernIr.TypeReference {
    return FernIr.TypeReference.named({
        typeId: `type_${name}`,
        fernFilepath: { allParts: [], packagePath: [], file: undefined },
        name: casingsGenerator.generateName(name),
        displayName: undefined,
        default: undefined,
        inline: undefined
    });
}

// biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext with custom type declarations
function createMockContextWithDeclarations(declarations: Record<string, FernIr.Type>): any {
    const base = createMockContext();
    base.type.getTypeDeclaration = (typeName: FernIr.DeclaredTypeName) => {
        const shape = declarations[typeName.typeId];
        if (shape) {
            return { shape };
        }
        return {
            shape: FernIr.Type.object({
                properties: [],
                extends: [],
                extraProperties: false,
                extendedProperties: undefined
            })
        };
    };
    return base;
}
