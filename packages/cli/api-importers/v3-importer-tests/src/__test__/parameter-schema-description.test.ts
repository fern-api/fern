import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getOriginalName, getWireValue } from "@fern-api/ir-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

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

describe("parameter descriptions declared inside the schema", () => {
    it("should fall back to the inline schema's description", async () => {
        const ir = await getIRForFixture("parameter-schema-description");

        const endpoint = Object.values(ir.services)[0]?.endpoints[0];
        expect(endpoint).toBeDefined();

        const pathParameter = endpoint?.pathParameters.find(
            (parameter) => getOriginalName(parameter.name) === "plantId"
        );
        expect(pathParameter?.docs).toBe("The plant's identifier, described inside the schema.");

        const cursor = endpoint?.queryParameters.find((parameter) => getWireValue(parameter.name) === "cursor");
        expect(cursor?.docs).toBe("The pagination cursor, described inside the schema.");

        const region = endpoint?.headers.find((header) => getWireValue(header.name) === "X-Region");
        expect(region?.docs).toBe("The region, described inside the schema.");
    });

    it("should prefer the parameter's own description", async () => {
        const ir = await getIRForFixture("parameter-schema-description");

        const endpoint = Object.values(ir.services)[0]?.endpoints[0];
        const limit = endpoint?.queryParameters.find((parameter) => getWireValue(parameter.name) === "limit");
        expect(limit?.docs).toBe("The page size, described on the parameter.");
    });

    it("should leave a referenced schema's description on the named type", async () => {
        const ir = await getIRForFixture("parameter-schema-description");

        const endpoint = Object.values(ir.services)[0]?.endpoints[0];
        const allHeaders = [...ir.headers, ...(endpoint?.headers ?? [])];
        const tenant = allHeaders.find((header) => getWireValue(header.name) === "X-Tenant");
        expect(tenant).toBeDefined();
        expect(tenant?.docs).toBeUndefined();
        expect(Object.values(ir.types).find((type) => type.name.name === "TenantId")?.docs).toBe(
            "The tenant identifier, described on the named type."
        );
    });

    it("should use a description declared beside a $ref", async () => {
        const ir = await getIRForFixture("parameter-schema-description");

        const endpoint = Object.values(ir.services)[0]?.endpoints[0];
        const allHeaders = [...ir.headers, ...(endpoint?.headers ?? [])];
        const workspace = allHeaders.find((header) => getWireValue(header.name) === "X-Workspace");
        expect(workspace?.docs).toBe("The workspace, described beside the reference.");
    });
});
