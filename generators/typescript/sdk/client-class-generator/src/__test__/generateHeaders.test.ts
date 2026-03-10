import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import {
    createHttpHeader,
    createMockCoreUtilities,
    createMockGeneratedSdkClientClass,
    createMockRequestParameter,
    createMockTypeContext
} from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import { generateHeaders } from "../endpoints/utils/generateHeaders.js";

function createMockContext() {
    const coreUtilities = createMockCoreUtilities();
    return {
        type: createMockTypeContext(),
        importsManager: {
            addImportFromRoot: () => {
                // no-op for test
            }
        },
        coreUtilities,
        authProvider: {
            isAuthEndpoint: () => false
        },
        versionContext: {
            getGeneratedVersion: () => undefined
        }
        // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
    } as any;
}

function statementsToString(statements: ts.Statement[]): string {
    return statements.map((stmt) => getTextOfTsNode(stmt)).join("\n");
}

describe("generateHeaders", () => {
    it("generates headers with no service/endpoint headers and no auth", () => {
        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        expect(result.length).toBeGreaterThan(0);
        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with service and endpoint headers", () => {
        const serviceHeaders = [
            createHttpHeader("X-API-Version", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                wireValue: "X-API-Version"
            })
        ];

        const endpointHeaders = [
            createHttpHeader("X-Request-Id", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                wireValue: "X-Request-Id"
            })
        ];

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: serviceHeaders } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: endpointHeaders, auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with idempotency headers when endpoint is idempotent", () => {
        const idempotencyHeaders = [
            createHttpHeader("Idempotency-Key", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                wireValue: "Idempotency-Key"
            })
        ];

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: true } as any,
            idempotencyHeaders
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers without idempotency headers when endpoint is not idempotent", () => {
        const idempotencyHeaders = [
            createHttpHeader("Idempotency-Key", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                wireValue: "Idempotency-Key"
            })
        ];

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates auth headers when auth provider exists and endpoint requires auth", () => {
        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass({ hasAuthProvider: true }),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: true, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with literal header value", () => {
        const literalHeader = createHttpHeader(
            "X-Fern-Language",
            FernIr.TypeReference.container(FernIr.ContainerType.literal(FernIr.Literal.string("JavaScript"))),
            { wireValue: "X-Fern-Language" }
        );

        const mockContext = createMockContext();
        // Override resolveTypeReference to return the literal container
        mockContext.type.resolveTypeReference = (typeRef: FernIr.TypeReference) => typeRef;

        const result = generateHeaders({
            context: mockContext,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [literalHeader] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with root-level overridable headers", () => {
        const rootHeaders = [
            createHttpHeader("X-Custom-Header", FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }), {
                wireValue: "X-Custom-Header"
            })
        ];

        const mockContext = createMockContext();

        const result = generateHeaders({
            context: mockContext,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: rootHeaders } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: []
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });

    it("generates headers with additional headers parameter", () => {
        const additionalHeaders = [
            {
                header: "X-Extra",
                value: ts.factory.createStringLiteral("extra-value")
            }
        ];

        const result = generateHeaders({
            context: createMockContext(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            intermediateRepresentation: { headers: [] } as any,
            generatedSdkClientClass: createMockGeneratedSdkClientClass(),
            requestParameter: createMockRequestParameter(),
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            service: { headers: [] } as any,
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal interface
            endpoint: { headers: [], auth: false, idempotent: false } as any,
            idempotencyHeaders: [],
            additionalHeaders
        });

        const text = statementsToString(result);
        expect(text).toMatchSnapshot();
    });
});
