import { APIV1Db, convertAPIDefinitionToDb, convertDbAPIDefinitionToRead, SDKSnippetHolder } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { convertIrToFdrApi } from "@fern-api/register";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURE_NAME = "endpoint-security-per-endpoint-auth";
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

describe("OpenAPI 3.1 -> IR: api.auth endpoint-security", () => {
    it("converts every declared auth-scheme instead of dropping them", async () => {
        const ir = await getIRForFixture(FIXTURE_NAME);

        expect(ir.auth.requirement).toBe("ENDPOINT_SECURITY");
        expect(ir.auth.schemes.map((scheme) => scheme.key)).toEqual(["PlantOAuth", "PlantApiKey"]);
        expect(ir.auth.schemes.map((scheme) => scheme.type)).toEqual(["oauth", "header"]);
    }, 90_000);

    it("keeps both requirements separate on an endpoint that accepts either scheme", async () => {
        const ir = await getIRForFixture(FIXTURE_NAME);

        const endpoint = findEndpointByOperationId(ir, "getPlant");
        expect(endpoint?.auth).toBe(true);
        expect(endpoint?.security).toEqual([{ PlantOAuth: [] }, { PlantApiKey: [] }]);
    }, 90_000);

    it("keeps a single-scheme endpoint scoped to that scheme", async () => {
        const ir = await getIRForFixture(FIXTURE_NAME);

        const endpoint = findEndpointByOperationId(ir, "listPremiumPlants");
        expect(endpoint?.auth).toBe(true);
        expect(endpoint?.security).toEqual([{ PlantOAuth: [] }]);
    }, 90_000);

    it("respects an explicit security: [] opt-out", async () => {
        const ir = await getIRForFixture(FIXTURE_NAME);

        const endpoint = findEndpointByOperationId(ir, "getToken");
        expect(endpoint?.auth).toBe(false);
        expect(endpoint?.security).toEqual([]);
    }, 90_000);

    it("requires no auth on an endpoint with no security field", async () => {
        const ir = await getIRForFixture(FIXTURE_NAME);

        // endpoint-security has no API-wide default to inherit.
        const endpoint = findEndpointByOperationId(ir, "listPublicPlants");
        expect(endpoint?.auth).toBe(false);
    }, 90_000);
});

describe("IR -> FDR: api.auth endpoint-security", () => {
    it("registers the auth schemes and per-endpoint auth options the docs resolve against", async () => {
        const ir = await getIRForFixture(FIXTURE_NAME);
        const context = createMockTaskContext();

        // This is the pipeline DocsDefinitionResolver uses. Previously `authSchemes` came
        // out empty and endpoints carried no `authV2`, so the api-reference fell back to a
        // synthetic "default" scheme id that resolved to nothing — every endpoint page
        // rendered with no auth method at all.
        const fdrApi = convertIrToFdrApi({
            ir,
            snippetsConfig: {
                typescriptSdk: undefined,
                pythonSdk: undefined,
                javaSdk: undefined,
                rubySdk: undefined,
                goSdk: undefined,
                csharpSdk: undefined,
                phpSdk: undefined,
                swiftSdk: undefined,
                rustSdk: undefined
            },
            context
        });

        expect(Object.keys(fdrApi.authSchemes ?? {})).toEqual(["PlantOAuth", "PlantApiKey"]);

        const getPlant = findFdrEndpointByPath(fdrApi, "/plants/{plantId}");
        expect(getPlant?.authV2).toEqual(["PlantOAuth", "PlantApiKey"]);
        expect(getPlant?.multiAuth).toEqual([{ schemes: ["PlantOAuth"] }, { schemes: ["PlantApiKey"] }]);

        const premium = findFdrEndpointByPath(fdrApi, "/plants/premium");
        expect(premium?.authV2).toEqual(["PlantOAuth"]);
        expect(premium?.multiAuth).toEqual([{ schemes: ["PlantOAuth"] }]);

        const token = findFdrEndpointByPath(fdrApi, "/oauth/token");
        expect(token?.auth).toBe(false);
        expect(token?.authV2).toEqual([]);

        const snippetHolder = new SDKSnippetHolder({
            snippetsBySdkId: {},
            snippetsConfigWithSdkId: {},
            snippetTemplatesByEndpoint: {},
            snippetsBySdkIdAndEndpointId: {},
            snippetTemplatesByEndpointId: {}
        });
        const dbDef = convertAPIDefinitionToDb(fdrApi, APIV1Db.ApiDefinitionId("test-api"), snippetHolder);
        expect(() => convertDbAPIDefinitionToRead(dbDef)).not.toThrow();
    }, 90_000);
});

function findEndpointByOperationId(
    ir: Awaited<ReturnType<typeof getIRForFixture>>,
    operationId: string
): (typeof ir.services)[string]["endpoints"][number] | undefined {
    for (const service of Object.values(ir.services)) {
        for (const endpoint of service.endpoints) {
            const originalName = typeof endpoint.name === "string" ? endpoint.name : endpoint.name.originalName;
            if (originalName === operationId) {
                return endpoint;
            }
        }
    }
    return undefined;
}

function findFdrEndpointByPath(fdrApi: ReturnType<typeof convertIrToFdrApi>, path: string) {
    const packages = [fdrApi.rootPackage, ...Object.values(fdrApi.subpackages)];
    for (const pkg of packages) {
        for (const endpoint of pkg.endpoints) {
            const joined = endpoint.path.parts
                .map((part) => (part.type === "pathParameter" ? `{${part.value}}` : part.value))
                .join("");
            if (joined === path) {
                return endpoint;
            }
        }
    }
    return undefined;
}
