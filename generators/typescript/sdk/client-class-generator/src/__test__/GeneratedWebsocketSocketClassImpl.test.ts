import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId } from "@fern-typescript/commons";
import { casingsGenerator } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { GeneratedWebsocketSocketClassImpl } from "../GeneratedWebsocketSocketClassImpl.js";

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function createWebSocketMessage(
    type: string,
    origin: "client" | "server",
    opts?: {
        methodName?: string;
        bodyType?: FernIr.TypeReference;
        isInlined?: boolean;
    }
): FernIr.WebSocketMessage {
    const bodyType = opts?.bodyType ?? FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined });
    const body: FernIr.WebSocketMessageBody = opts?.isInlined
        ? FernIr.WebSocketMessageBody.inlinedBody({
              name: casingsGenerator.generateName(type),
              extends: [],
              properties: []
          })
        : FernIr.WebSocketMessageBody.reference({ bodyType, docs: undefined });
    return {
        type,
        displayName: undefined,
        origin,
        body,
        methodName: opts?.methodName ?? undefined,
        docs: undefined,
        availability: undefined
    };
}

function createChannel(opts?: { messages?: FernIr.WebSocketMessage[] }): FernIr.WebSocketChannel {
    return {
        name: casingsGenerator.generateName("ChatChannel"),
        displayName: undefined,
        connectMethodName: undefined,
        baseUrl: undefined,
        path: { head: "/ws", parts: [] },
        auth: false,
        headers: [],
        queryParameters: [],
        pathParameters: [],
        messages: opts?.messages ?? [
            createWebSocketMessage("sendMessage", "client"),
            createWebSocketMessage("receiveMessage", "server")
        ],
        docs: undefined,
        availability: undefined,
        examples: [],
        v2Examples: undefined
    };
}

// biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
function createMockContext(): any {
    const addedModules: unknown[] = [];
    const addedClasses: unknown[] = [];
    return {
        sourceFile: {
            addModule: (m: unknown) => addedModules.push(m),
            addClass: (c: unknown) => addedClasses.push(c)
        },
        coreUtilities: {
            websocket: {
                ReconnectingWebSocket: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("ReconnectingWebSocket")
                },
                CloseEvent: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("CloseEvent")
                },
                ErrorEvent: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("ErrorEvent")
                }
            },
            zurg: {
                object: (properties: unknown[]) => ({
                    jsonOrThrow: (expr: ts.Expression) =>
                        ts.factory.createCallExpression(
                            ts.factory.createIdentifier("serializer.jsonOrThrow"),
                            undefined,
                            [expr]
                        ),
                    properties
                })
            }
        },
        jsonContext: {
            getReferenceToToJson: () => ({
                getTypeNode: () => ts.factory.createIdentifier("toJson")
            }),
            getReferenceToFromJson: () => ({
                getTypeNode: () => ts.factory.createIdentifier("fromJson")
            })
        },
        type: {
            getReferenceToType: () => ({
                typeNode: ts.factory.createTypeReferenceNode("string"),
                isOptional: false
            }),
            resolveTypeReference: (typeRef: FernIr.TypeReference) => typeRef
        },
        typeSchema: {
            getSchemaOfTypeReference: () => ({
                jsonOrThrow: (expr: ts.Expression, _opts: unknown) =>
                    ts.factory.createCallExpression(ts.factory.createIdentifier("schema.jsonOrThrow"), undefined, [
                        expr
                    ])
            })
        },
        websocketTypeSchema: {
            getGeneratedWebsocketResponseTypeSchema: () => ({
                deserializeResponse: (expr: ts.Expression) =>
                    ts.factory.createCallExpression(ts.factory.createIdentifier("responseSchema.parse"), undefined, [
                        expr
                    ])
            })
        },
        logger: {
            warn: () => undefined
        },
        _addedModules: addedModules,
        _addedClasses: addedClasses
    };
}

function createImpl(opts?: {
    includeSerdeLayer?: boolean;
    retainOriginalCasing?: boolean;
    omitUndefined?: boolean;
    skipResponseValidation?: boolean;
    channel?: FernIr.WebSocketChannel;
    serviceClassName?: string;
}): GeneratedWebsocketSocketClassImpl {
    return new GeneratedWebsocketSocketClassImpl({
        packageId: "pkg_test" as unknown as PackageId,
        includeSerdeLayer: opts?.includeSerdeLayer ?? true,
        channel: opts?.channel ?? createChannel(),
        serviceClassName: opts?.serviceClassName ?? "ChatSocket",
        retainOriginalCasing: opts?.retainOriginalCasing ?? false,
        omitUndefined: opts?.omitUndefined ?? false,
        skipResponseValidation: opts?.skipResponseValidation ?? false
    });
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

describe("GeneratedWebsocketSocketClassImpl", () => {
    describe("constructor", () => {
        it("creates instance with default options", () => {
            const impl = createImpl();
            expect(impl).toBeDefined();
        });
    });

    describe("writeToFile", () => {
        it("adds module and class to source file with includeSerdeLayer=true", () => {
            const impl = createImpl({ includeSerdeLayer: true });
            const context = createMockContext();
            impl.writeToFile(context);

            expect(context._addedModules).toHaveLength(1);
            expect(context._addedClasses).toHaveLength(1);
        });

        it("adds module and class to source file with includeSerdeLayer=false", () => {
            const impl = createImpl({ includeSerdeLayer: false });
            const context = createMockContext();
            impl.writeToFile(context);

            expect(context._addedModules).toHaveLength(1);
            expect(context._addedClasses).toHaveLength(1);

            // When includeSerdeLayer=false, a sendJson method should be added
            const classStructure = context._addedClasses[0] as { methods: { name: string }[] };
            const methodNames = classStructure.methods.map((m: { name: string }) => m.name);
            expect(methodNames).toContain("sendJson");
        });

        it("generates module with Args, Response, and EventHandlers types", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const moduleStructure = context._addedModules[0] as { name: string; statements: { name: string }[] };
            expect(moduleStructure.name).toBe("ChatSocket");
            expect(moduleStructure.statements).toHaveLength(3);

            const statementNames = moduleStructure.statements.map((s: { name: string }) => s.name);
            expect(statementNames).toContain("Args");
            expect(statementNames).toContain("Response");
            expect(statementNames).toContain("EventHandlers");
        });

        it("generates class with socket and eventHandlers properties", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as {
                name: string;
                properties: { name: string }[];
            };
            expect(classStructure.name).toBe("ChatSocket");
            const propertyNames = classStructure.properties.map((p: { name: string }) => p.name);
            expect(propertyNames).toContain("socket");
            expect(propertyNames).toContain("eventHandlers");
            // Handler properties
            expect(propertyNames).toContain("handleOpen");
            expect(propertyNames).toContain("handleMessage");
            expect(propertyNames).toContain("handleClose");
            expect(propertyNames).toContain("handleError");
        });

        it("generates class with expected methods", () => {
            const impl = createImpl({ includeSerdeLayer: true });
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as { methods: { name: string }[] };
            const methodNames = classStructure.methods.map((m: { name: string }) => m.name);
            expect(methodNames).toContain("on");
            expect(methodNames).toContain("connect");
            expect(methodNames).toContain("close");
            expect(methodNames).toContain("waitForOpen");
            expect(methodNames).toContain("assertSocketIsOpen");
            expect(methodNames).toContain("sendBinary");
            // With serde layer, sendJson should NOT be included
            expect(methodNames).not.toContain("sendJson");
        });

        it("generates constructor with event listener setup", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as { ctors: { statements: string[] }[] };
            expect(classStructure.ctors).toHaveLength(1);
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            const ctorStatements = classStructure.ctors[0]!.statements;
            expect(ctorStatements.some((s: string) => s.includes("addEventListener"))).toBe(true);
            expect(ctorStatements.some((s: string) => s.includes('"open"'))).toBe(true);
            expect(ctorStatements.some((s: string) => s.includes('"message"'))).toBe(true);
            expect(ctorStatements.some((s: string) => s.includes('"close"'))).toBe(true);
            expect(ctorStatements.some((s: string) => s.includes('"error"'))).toBe(true);
        });

        it("generates readyState getter", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as { getAccessors: { name: string }[] };
            expect(classStructure.getAccessors).toHaveLength(1);
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(classStructure.getAccessors[0]!.name).toBe("readyState");
        });
    });

    describe("send helper methods", () => {
        it("generates send method per client message with serde layer", () => {
            const channel = createChannel({
                messages: [
                    createWebSocketMessage("sendChat", "client"),
                    createWebSocketMessage("sendTyping", "client"),
                    createWebSocketMessage("receiveChat", "server")
                ]
            });
            const impl = createImpl({ channel, includeSerdeLayer: true });
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as { methods: { name: string; statements: string[] }[] };
            const sendMethods = classStructure.methods.filter(
                (m: { name: string }) => m.name.startsWith("send") && m.name !== "sendBinary"
            );
            // Should have 2 client send methods
            expect(sendMethods).toHaveLength(2);
            // With serde layer, should use JSON.stringify
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(sendMethods[0]!.statements.some((s: string) => s.includes("JSON.stringify"))).toBe(true);
        });

        it("generates send method without serde layer (uses sendJson)", () => {
            const channel = createChannel({
                messages: [createWebSocketMessage("sendChat", "client")]
            });
            const impl = createImpl({ channel, includeSerdeLayer: false });
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as { methods: { name: string; statements: string[] }[] };
            const sendMethods = classStructure.methods.filter(
                (m: { name: string }) => m.name.startsWith("send") && m.name !== "sendBinary" && m.name !== "sendJson"
            );
            expect(sendMethods).toHaveLength(1);
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(sendMethods[0]!.statements.some((s: string) => s.includes("sendJson"))).toBe(true);
        });

        it("uses custom methodName when provided", () => {
            const channel = createChannel({
                messages: [createWebSocketMessage("sendChat", "client", { methodName: "publishChat" })]
            });
            const impl = createImpl({ channel });
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as { methods: { name: string }[] };
            const methodNames = classStructure.methods.map((m: { name: string }) => m.name);
            expect(methodNames).toContain("publishChat");
        });

        it("generates bytes send method for BASE_64 body type", () => {
            const bytesType = FernIr.TypeReference.primitive({
                v1: "BASE_64",
                v2: undefined
            });
            const channel = createChannel({
                messages: [createWebSocketMessage("sendBinaryData", "client", { bodyType: bytesType })]
            });
            const impl = createImpl({ channel });
            const context = createMockContext();
            // Override resolveTypeReference to return primitive for bytes
            context.type.resolveTypeReference = () => ({
                type: "primitive",
                primitive: { v1: "BASE_64", v2: undefined }
            });
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as {
                methods: { name: string; parameters: { type: string }[]; statements: string[] }[];
            };
            const bytesMethods = classStructure.methods.filter((m) =>
                m.parameters?.some((p) => p.type === "ArrayBuffer | Blob | ArrayBufferView")
            );
            expect(bytesMethods.length).toBeGreaterThanOrEqual(1);
        });

        it("generates bytes send method for binary format string type", () => {
            const binaryStringType = FernIr.TypeReference.primitive({
                v1: "STRING",
                v2: FernIr.PrimitiveTypeV2.string({
                    default: undefined,
                    validation: { format: "binary", minLength: undefined, maxLength: undefined, pattern: undefined }
                })
            });
            const channel = createChannel({
                messages: [createWebSocketMessage("sendFile", "client", { bodyType: binaryStringType })]
            });
            const impl = createImpl({ channel });
            const context = createMockContext();
            context.type.resolveTypeReference = () => ({
                type: "primitive",
                primitive: {
                    v1: "STRING",
                    v2: {
                        type: "string",
                        validation: {
                            format: "binary",
                            minLength: undefined,
                            maxLength: undefined,
                            pattern: undefined
                        },
                        default: undefined
                    }
                }
            });
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as {
                methods: { name: string; parameters: { type: string }[] }[];
            };
            const bytesMethods = classStructure.methods.filter((m) =>
                m.parameters?.some((p) => p.type === "ArrayBuffer | Blob | ArrayBufferView")
            );
            expect(bytesMethods.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("connect method", () => {
        it("generates connect method that returns this and reconnects", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as {
                methods: { name: string; statements: string[]; returnType: string }[];
            };
            const connectMethod = classStructure.methods.find((m: { name: string }) => m.name === "connect");
            expect(connectMethod).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(connectMethod!.returnType).toBe("ChatSocket");
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(connectMethod!.statements.some((s: string) => s.includes("reconnect"))).toBe(true);
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(connectMethod!.statements.some((s: string) => s.includes("return this"))).toBe(true);
        });
    });

    describe("close method", () => {
        it("generates close method that removes event listeners", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as { methods: { name: string; statements: string[] }[] };
            const closeMethod = classStructure.methods.find((m: { name: string }) => m.name === "close");
            expect(closeMethod).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(closeMethod!.statements.some((s: string) => s.includes("removeEventListener"))).toBe(true);
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(closeMethod!.statements.some((s: string) => s.includes("handleClose"))).toBe(true);
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(closeMethod!.statements.some((s: string) => s.includes("1000"))).toBe(true);
        });
    });

    describe("handler register (on method)", () => {
        it("generates on method with event and callback parameters", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as {
                methods: { name: string; parameters: { name: string }[]; typeParameters: { name: string }[] }[];
            };
            const onMethod = classStructure.methods.find((m: { name: string }) => m.name === "on");
            expect(onMethod).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(onMethod!.typeParameters[0]!.name).toBe("T");
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(onMethod!.parameters.map((p: { name: string }) => p.name)).toEqual(["event", "callback"]);
        });
    });

    describe("handleMessage with serde layer", () => {
        it("generates handleMessage that parses response with serde layer", () => {
            const impl = createImpl({ includeSerdeLayer: true });
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as { properties: { name: string; initializer: string }[] };
            const handleMessageProp = classStructure.properties.find(
                (p: { name: string }) => p.name === "handleMessage"
            );
            expect(handleMessageProp).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(handleMessageProp!.initializer).toContain("fromJson");
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(handleMessageProp!.initializer).toContain("parsedResponse");
        });

        it("generates handleMessage without serde layer (direct cast)", () => {
            const impl = createImpl({ includeSerdeLayer: false });
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as { properties: { name: string; initializer: string }[] };
            const handleMessageProp = classStructure.properties.find(
                (p: { name: string }) => p.name === "handleMessage"
            );
            expect(handleMessageProp).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(handleMessageProp!.initializer).toContain("message");
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(handleMessageProp!.initializer).not.toContain("parsedResponse");
        });
    });

    describe("no messages", () => {
        it("warns and uses never type when no server messages", () => {
            const channel = createChannel({
                messages: [createWebSocketMessage("sendChat", "client")]
            });
            const impl = createImpl({ channel });
            const context = createMockContext();
            let warnCalled = false;
            context.logger.warn = () => {
                warnCalled = true;
            };
            impl.writeToFile(context);

            expect(warnCalled).toBe(true);
        });

        it("warns when no client messages", () => {
            const channel = createChannel({
                messages: [createWebSocketMessage("receiveChat", "server")]
            });
            const impl = createImpl({ channel });
            const context = createMockContext();
            // No client messages means no send helper methods generated
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as { methods: { name: string }[] };
            const sendMethods = classStructure.methods.filter(
                (m: { name: string }) => m.name.startsWith("send") && m.name !== "sendBinary" && m.name !== "sendJson"
            );
            expect(sendMethods).toHaveLength(0);
        });
    });

    describe("waitForOpen method", () => {
        it("generates async waitForOpen that returns Promise<ReconnectingWebSocket>", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as {
                methods: { name: string; isAsync: boolean; returnType: string }[];
            };
            const waitMethod = classStructure.methods.find((m: { name: string }) => m.name === "waitForOpen");
            expect(waitMethod).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(waitMethod!.isAsync).toBe(true);
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(waitMethod!.returnType).toContain("Promise");
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(waitMethod!.returnType).toContain("ReconnectingWebSocket");
        });
    });

    describe("assertSocketIsOpen method", () => {
        it("generates private assertSocketIsOpen method", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as {
                methods: { name: string; scope: string; statements: string[] }[];
            };
            const assertMethod = classStructure.methods.find((m: { name: string }) => m.name === "assertSocketIsOpen");
            expect(assertMethod).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(assertMethod!.statements.some((s: string) => s.includes("Socket is not connected"))).toBe(true);
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(assertMethod!.statements.some((s: string) => s.includes("Socket is not open"))).toBe(true);
        });
    });

    describe("sendBinary method", () => {
        it("generates sendBinary with binary payload parameter", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as {
                methods: { name: string; parameters: { name: string; type: string }[] }[];
            };
            const sendBinaryMethod = classStructure.methods.find((m: { name: string }) => m.name === "sendBinary");
            expect(sendBinaryMethod).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(sendBinaryMethod!.parameters[0]!.type).toBe("ArrayBuffer | Blob | ArrayBufferView");
        });
    });

    describe("handleOpen property", () => {
        it("generates handleOpen that calls eventHandlers.open", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as { properties: { name: string; initializer: string }[] };
            const handleOpen = classStructure.properties.find((p: { name: string }) => p.name === "handleOpen");
            expect(handleOpen).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(handleOpen!.initializer).toContain("eventHandlers.open");
        });
    });

    describe("handleClose property", () => {
        it("generates handleClose that calls eventHandlers.close with CloseEvent", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as {
                properties: { name: string; type: string; initializer: string }[];
            };
            const handleClose = classStructure.properties.find((p: { name: string }) => p.name === "handleClose");
            expect(handleClose).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(handleClose!.type).toContain("CloseEvent");
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(handleClose!.initializer).toContain("eventHandlers.close");
        });
    });

    describe("handleError property", () => {
        it("generates handleError that wraps error in Error object", () => {
            const impl = createImpl();
            const context = createMockContext();
            impl.writeToFile(context);

            const classStructure = context._addedClasses[0] as {
                properties: { name: string; type: string; initializer: string }[];
            };
            const handleError = classStructure.properties.find((p: { name: string }) => p.name === "handleError");
            expect(handleError).toBeDefined();
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(handleError!.type).toContain("ErrorEvent");
            // biome-ignore lint/style/noNonNullAssertion: Safe - value asserted above
            expect(handleError!.initializer).toContain("new Error");
        });
    });
});
