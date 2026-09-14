import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { AvailabilityStatus, TypeReference } from "@fern-api/ir-sdk";
import { getOriginalName, getWireValue } from "@fern-api/ir-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

async function getIRForFixture(fixtureName: string) {
    const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixtureName), RelativeFilePath.of("fern"));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fixturePath,
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load OpenAPI fixture ${fixtureName}\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace for fixture ${fixtureName}`);
    }
    return workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: true,
        logWarnings: false
    });
}

function unwrapOptional(type: TypeReference | undefined): TypeReference | undefined {
    if (type?.type === "container" && type.container.type === "optional") {
        return type.container.optional;
    }
    return type;
}

describe("response header schemas", () => {
    it("converts object and enum response header schemas to named type references", async () => {
        const ir = await getIRForFixture("response-headers");

        const endpoint = Object.values(ir.services)
            .flatMap((service) => service.endpoints)
            .find((endpoint) => getOriginalName(endpoint.name) === "listUsers");
        expect(endpoint).toBeDefined();

        const headers = new Map((endpoint?.responseHeaders ?? []).map((header) => [getWireValue(header.name), header]));

        // Non-required primitive response headers are optional<primitive>.
        expect(headers.get("X-Request-Id")?.valueType.type).toBe("container");
        expect(unwrapOptional(headers.get("X-Rate-Limit-Remaining")?.valueType)?.type).toBe("primitive");
        expect(unwrapOptional(headers.get("X-Is-Cached")?.valueType)?.type).toBe("primitive");

        // `required: true` on the Header Object suppresses the optional wrapper for both
        // named and primitive value types, matching request-parameter `required`.
        expect(headers.get("X-Required-Policy")?.valueType.type).toBe("named");
        expect(headers.get("X-Required-Count")?.valueType.type).toBe("primitive");

        // An enum schema $ref produces an optional named reference instead of optional<string>.
        const rateLimitPolicy = unwrapOptional(headers.get("X-Rate-Limit-Policy")?.valueType);
        expect(rateLimitPolicy?.type).toBe("named");
        if (rateLimitPolicy?.type === "named") {
            expect(ir.types[rateLimitPolicy.typeId]?.shape.type).toBe("enum");
        }

        // Header-level `deprecated` propagates to the header's availability.
        expect(headers.get("X-Rate-Limit-Policy")?.availability?.status).toBe(AvailabilityStatus.Deprecated);

        // A JSON `content` schema produces an optional named reference to the object type.
        const accountInfo = unwrapOptional(headers.get("X-Account-Info")?.valueType);
        expect(accountInfo?.type).toBe("named");
        if (accountInfo?.type === "named") {
            const shape = ir.types[accountInfo.typeId]?.shape;
            expect(shape?.type).toBe("object");
        }
    });

    it("keeps primitive fast-paths and schema defaults for scalar response headers", async () => {
        const ir = await getIRForFixture("response-headers");

        const endpoint = Object.values(ir.services)
            .flatMap((service) => service.endpoints)
            .find((endpoint) => getOriginalName(endpoint.name) === "listUsers");
        const headers = new Map((endpoint?.responseHeaders ?? []).map((header) => [getWireValue(header.name), header]));

        // `number` headers take the primitive fast-path just like `integer`/`boolean`.
        const score = unwrapOptional(headers.get("X-Score")?.valueType);
        expect(score?.type).toBe("primitive");

        // Schema-level `default` propagates to the header's defaultValue.
        const quota = headers.get("X-Quota");
        expect(unwrapOptional(quota?.valueType)?.type).toBe("primitive");
        expect(quota?.defaultValue).toBe(100);

        // A header declared with only a description still falls back to optional<string>.
        const noSchema = headers.get("X-No-Schema")?.valueType;
        expect(noSchema?.type).toBe("container");
        expect(unwrapOptional(noSchema)?.type).toBe("primitive");
    });

    it("converts array, inline-object, and $ref'd Header Object response headers", async () => {
        const ir = await getIRForFixture("response-headers");

        const endpoint = Object.values(ir.services)
            .flatMap((service) => service.endpoints)
            .find((endpoint) => getOriginalName(endpoint.name) === "listUsers");
        const headers = new Map((endpoint?.responseHeaders ?? []).map((header) => [getWireValue(header.name), header]));

        // Array schemas wrap as optional<list<...>> instead of optional<string>.
        const tags = unwrapOptional(headers.get("X-Tags")?.valueType);
        expect(tags?.type).toBe("container");
        if (tags?.type === "container") {
            expect(tags.container.type).toBe("list");
        }

        // An inline (non-$ref) object schema registers a real object type.
        const inlineInfo = unwrapOptional(headers.get("X-Inline-Info")?.valueType);
        expect(inlineInfo?.type).toBe("named");
        if (inlineInfo?.type === "named") {
            expect(ir.types[inlineInfo.typeId]?.shape.type).toBe("object");
        }

        // A header that is itself a $ref into components/headers resolves first; its
        // `required: true` applies too, so the value type is not optional-wrapped.
        const trace = headers.get("X-Trace")?.valueType;
        expect(trace?.type).toBe("named");
        if (trace?.type === "named") {
            expect(ir.types[trace.typeId]?.shape.type).toBe("object");
        }
    });

    it("honors header-level availability extensions and ignores non-JSON content", async () => {
        const ir = await getIRForFixture("response-headers");

        const endpoint = Object.values(ir.services)
            .flatMap((service) => service.endpoints)
            .find((endpoint) => getOriginalName(endpoint.name) === "listUsers");
        const headers = new Map((endpoint?.responseHeaders ?? []).map((header) => [getWireValue(header.name), header]));

        // `x-fern-availability` on the Header Object propagates to the header.
        expect(headers.get("X-Beta-Feature")?.availability?.status).toBe(AvailabilityStatus.Beta);

        // A `content` map without a JSON media type falls back to optional<string>.
        const plainOnly = unwrapOptional(headers.get("X-Plain-Only")?.valueType);
        expect(plainOnly?.type).toBe("primitive");

        // With multiple content media types, the JSON entry's schema is used.
        const mixedContent = unwrapOptional(headers.get("X-Mixed-Content")?.valueType);
        expect(mixedContent?.type).toBe("named");
        if (mixedContent?.type === "named") {
            expect(ir.types[mixedContent.typeId]?.shape.type).toBe("object");
        }
    });

    it("leaves content-based headers as optional<string> without respect-parameter-content", async () => {
        const ir = await getIRForFixture("response-headers-no-respect-content");

        const endpoint = Object.values(ir.services)
            .flatMap((service) => service.endpoints)
            .find((endpoint) => getOriginalName(endpoint.name) === "listUsers");
        const headers = new Map((endpoint?.responseHeaders ?? []).map((header) => [getWireValue(header.name), header]));

        const accountInfo = unwrapOptional(headers.get("X-Account-Info")?.valueType);
        expect(accountInfo?.type).toBe("primitive");
    });

    it("converts error response header schemas to named type references", async () => {
        const ir = await getIRForFixture("response-headers");

        const error = Object.values(ir.errors).find((declaration) => declaration.statusCode === 404);
        expect(error).toBeDefined();

        const errorInfo = error?.headers?.find((header) => getWireValue(header.name) === "X-Error-Info");
        expect(errorInfo).toBeDefined();

        const errorInfoType = unwrapOptional(errorInfo?.valueType);
        expect(errorInfoType?.type).toBe("named");
        if (errorInfoType?.type === "named") {
            expect(ir.types[errorInfoType.typeId]?.shape.type).toBe("object");
        }
    });
});
