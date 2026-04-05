import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode, PackageId, Zurg } from "@fern-typescript/commons";
import { createMockReference } from "@fern-typescript/test-utils";
import { Project, ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedWebsocketResponseSchemaImpl } from "../GeneratedWebsocketResponseSchemaImpl.js";
import { WebsocketTypeSchemaGenerator } from "../WebsocketTypeSchemaGenerator.js";

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

const MOCK_PACKAGE_ID = "pkg_test" as unknown as PackageId;

function createMockZurgSchema(name: string): Zurg.Schema {
    return {
        toExpression: () => ts.factory.createIdentifier(name),
        parse: (ref: ts.Expression, opts?: Record<string, unknown>) => {
            const args: ts.Expression[] = [ref];
            if (opts && Object.keys(opts).length > 0) {
                args.push(
                    ts.factory.createObjectLiteralExpression(
                        Object.entries(opts)
                            .filter(([, v]) => v !== undefined)
                            .map(([k, v]) =>
                                ts.factory.createPropertyAssignment(
                                    k,
                                    typeof v === "boolean"
                                        ? v
                                            ? ts.factory.createTrue()
                                            : ts.factory.createFalse()
                                        : ts.factory.createStringLiteral(String(v))
                                )
                            )
                    )
                );
            }
            return ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(name), "parse"),
                undefined,
                args
            );
        },
        json: (ref: ts.Expression) =>
            ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier(name), "json"),
                undefined,
                [ref]
            ),
        toZurgExpression: () => ({
            expression: ts.factory.createIdentifier(name),
            isOptional: false
        })
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

function createMockFileContext() {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile("test.ts", "");
    return {
        sourceFile,
        type: {
            getReferenceToType: () => ({
                typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                typeNodeWithoutUndefined: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
                isOptional: false
            })
        },
        typeSchema: {
            getReferenceToRawType: () => ({
                typeNode: ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
            }),
            getSchemaOfTypeReference: () => createMockZurgSchema("MessageSchema")
        },
        websocketTypeSchema: {
            getReferenceToWebsocketResponseType: () => createMockReference("WebsocketResponse")
        },
        coreUtilities: {
            zurg: {
                Schema: {
                    _getReferenceToType: ({
                        rawShape,
                        parsedShape
                    }: {
                        rawShape: ts.TypeNode;
                        parsedShape: ts.TypeNode;
                    }) =>
                        ts.factory.createTypeReferenceNode("Schema", [
                            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(getTextOfTsNode(rawShape))),
                            ts.factory.createTypeReferenceNode(
                                ts.factory.createIdentifier(getTextOfTsNode(parsedShape))
                            )
                        ]),
                    _fromExpression: (expr: ts.Expression) => createMockZurgSchema(getTextOfTsNode(expr))
                },
                never: () => createMockZurgSchema("z.never"),
                undiscriminatedUnion: (schemas: Zurg.Schema[]) =>
                    createMockZurgSchema(`z.undiscriminatedUnion([${schemas.map(() => "schema").join(", ")}])`)
            }
        },
        logger: {
            // biome-ignore lint/suspicious/noEmptyBlockStatements: test mock no-op
            warn: () => {}
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

function createMockChannel(name = "testChannel"): FernIr.WebSocketChannel {
    return {
        name,
        displayName: undefined,
        path: { head: "/ws", parts: [] },
        auth: false,
        headers: [],
        queryParameters: [],
        pathParameters: [],
        allPathParameters: [],
        messages: [],
        examples: [],
        docs: undefined,
        availability: undefined
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

function createMockReceiveMessage(): FernIr.WebSocketMessageBodyReference {
    return {
        bodyType: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined })
        // biome-ignore lint/suspicious/noExplicitAny: test mock
    } as any;
}

// ────────────────────────────────────────────────────────────────────────────
// WebsocketTypeSchemaGenerator (factory)
// ────────────────────────────────────────────────────────────────────────────

describe("WebsocketTypeSchemaGenerator", () => {
    it("creates GeneratedWebsocketResponseSchemaImpl with flags", () => {
        const generator = new WebsocketTypeSchemaGenerator({
            includeSerdeLayer: true,
            omitUndefined: false,
            skipResponseValidation: false
        });
        const result = generator.generateInlinedWebsocketMessageBodySchema({
            packageId: MOCK_PACKAGE_ID,
            channel: createMockChannel(),
            receiveMessages: [],
            typeName: "TestSchema"
        });
        expect(result).toBeDefined();
    });

    it("passes through all configuration flags", () => {
        const generator = new WebsocketTypeSchemaGenerator({
            includeSerdeLayer: false,
            omitUndefined: true,
            skipResponseValidation: true
        });
        const result = generator.generateInlinedWebsocketMessageBodySchema({
            packageId: MOCK_PACKAGE_ID,
            channel: createMockChannel(),
            receiveMessages: [createMockReceiveMessage()],
            typeName: "MessageSchema"
        });
        expect(result).toBeDefined();
    });
});

// ────────────────────────────────────────────────────────────────────────────
// GeneratedWebsocketResponseSchemaImpl
// ────────────────────────────────────────────────────────────────────────────

describe("GeneratedWebsocketResponseSchemaImpl", () => {
    function createImpl(opts?: {
        receiveMessages?: FernIr.WebSocketMessageBodyReference[];
        includeSerdeLayer?: boolean;
        omitUndefined?: boolean;
        skipResponseValidation?: boolean;
        channelName?: string;
    }) {
        return new GeneratedWebsocketResponseSchemaImpl({
            packageId: MOCK_PACKAGE_ID,
            channel: createMockChannel(opts?.channelName),
            receiveMessages: opts?.receiveMessages ?? [],
            typeName: "WebsocketResponseSchema",
            includeSerdeLayer: opts?.includeSerdeLayer ?? true,
            omitUndefined: opts?.omitUndefined ?? false,
            skipResponseValidation: opts?.skipResponseValidation ?? false
        });
    }

    describe("deserializeResponse", () => {
        it("returns raw reference when includeSerdeLayer is false", () => {
            const impl = createImpl({ includeSerdeLayer: false });
            const context = createMockFileContext();
            const rawRef = ts.factory.createIdentifier("rawData");
            const result = impl.deserializeResponse(rawRef, context);
            expect(getTextOfTsNode(result)).toBe("rawData");
        });

        it("returns parsed expression when includeSerdeLayer is true", () => {
            const impl = createImpl({
                includeSerdeLayer: true,
                receiveMessages: [createMockReceiveMessage()]
            });
            const context = createMockFileContext();
            const rawRef = ts.factory.createIdentifier("rawData");
            const result = impl.deserializeResponse(rawRef, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("respects omitUndefined flag", () => {
            const impl = createImpl({
                includeSerdeLayer: true,
                omitUndefined: true,
                receiveMessages: [createMockReceiveMessage()]
            });
            const context = createMockFileContext();
            const rawRef = ts.factory.createIdentifier("rawData");
            const result = impl.deserializeResponse(rawRef, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });

        it("respects skipResponseValidation flag", () => {
            const impl = createImpl({
                includeSerdeLayer: true,
                skipResponseValidation: true,
                receiveMessages: [createMockReceiveMessage()]
            });
            const context = createMockFileContext();
            const rawRef = ts.factory.createIdentifier("rawData");
            const result = impl.deserializeResponse(rawRef, context);
            expect(getTextOfTsNode(result)).toMatchSnapshot();
        });
    });

    describe("writeToFile", () => {
        it("writes schema for channel with no receive messages", () => {
            const impl = createImpl({ receiveMessages: [] });
            const context = createMockFileContext();
            impl.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes schema for channel with single receive message", () => {
            const impl = createImpl({
                receiveMessages: [createMockReceiveMessage()]
            });
            const context = createMockFileContext();
            impl.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });

        it("writes schema for channel with multiple receive messages", () => {
            const impl = createImpl({
                receiveMessages: [createMockReceiveMessage(), createMockReceiveMessage()]
            });
            const context = createMockFileContext();
            impl.writeToFile(context);
            expect(context.sourceFile.getFullText()).toMatchSnapshot();
        });
    });
});
