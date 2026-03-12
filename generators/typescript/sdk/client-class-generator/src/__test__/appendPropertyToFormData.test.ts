import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { casingsGenerator, createInlinedRequestBodyProperty, createNameAndWireValue } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";
import { appendPropertyToFormData } from "../endpoints/utils/appendPropertyToFormData.js";
import { FileUploadRequestParameter } from "../request-parameter/FileUploadRequestParameter.js";

const STRING_TYPE = FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });
const OPTIONAL_STRING_TYPE = FernIr.TypeReference.container(FernIr.ContainerType.optional(STRING_TYPE));
const LIST_STRING_TYPE = FernIr.TypeReference.container(FernIr.ContainerType.list(STRING_TYPE));
const SET_STRING_TYPE = FernIr.TypeReference.container(FernIr.ContainerType.set(STRING_TYPE));
const UNKNOWN_TYPE = FernIr.TypeReference.unknown();

// biome-ignore lint/suspicious/noExplicitAny: test mock for SdkContext
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
                appendFile: ({ key, value }: { referenceToFormData: ts.Expression; key: string; value: ts.Expression }) =>
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
        }
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
                property.name.name.camelCase.unsafeName
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
    });
});
