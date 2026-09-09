import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { TypeReference } from "@fern-api/ir-sdk";
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

        // Primitive response headers keep their previous scalar typing.
        expect(headers.get("X-Request-Id")?.valueType.type).toBe("container");
        expect(headers.get("X-Rate-Limit-Remaining")?.valueType.type).toBe("primitive");
        expect(headers.get("X-Is-Cached")?.valueType.type).toBe("primitive");

        // An enum schema $ref produces an optional named reference instead of optional<string>.
        const rateLimitPolicy = unwrapOptional(headers.get("X-Rate-Limit-Policy")?.valueType);
        expect(rateLimitPolicy?.type).toBe("named");
        if (rateLimitPolicy?.type === "named") {
            expect(ir.types[rateLimitPolicy.typeId]?.shape.type).toBe("enum");
        }

        // A JSON `content` schema produces an optional named reference to the object type.
        const accountInfo = unwrapOptional(headers.get("X-Account-Info")?.valueType);
        expect(accountInfo?.type).toBe("named");
        if (accountInfo?.type === "named") {
            const shape = ir.types[accountInfo.typeId]?.shape;
            expect(shape?.type).toBe("object");
        }
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
