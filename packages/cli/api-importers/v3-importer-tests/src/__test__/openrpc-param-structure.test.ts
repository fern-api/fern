import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { HttpEndpoint, IntermediateRepresentation } from "@fern-api/ir-sdk";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { convertIrToFdrApi } from "@fern-api/register";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURE_PATH = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/openrpc-param-structure/fern"));

async function getIR(): Promise<IntermediateRepresentation> {
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: FIXTURE_PATH,
        context,
        cliVersion: "0.0.0",
        workspaceName: "openrpc-param-structure"
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load fixture\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error("Expected OSSWorkspace");
    }
    return workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        logWarnings: false
    });
}

function endpointsByName(ir: IntermediateRepresentation): Record<string, HttpEndpoint> {
    return Object.fromEntries(
        Object.values(ir.services)
            .flatMap((service) => service.endpoints)
            .map((endpoint) => [endpoint.id, endpoint])
    );
}

describe("OpenRPC paramStructure", () => {
    it("carries each method's paramStructure into the IR and the FDR protocol", async () => {
        const ir = await getIR();
        const endpoints = endpointsByName(ir);
        expect(endpoints["plants.water"]?.source).toMatchObject({ type: "openrpc", paramStructure: "BY_NAME" });
        expect(endpoints["plants.prune"]?.source).toMatchObject({ type: "openrpc", paramStructure: "BY_POSITION" });
        expect(endpoints["plants.list"]?.source).toMatchObject({ type: "openrpc", paramStructure: undefined });

        expect(endpoints["plants.water"]?.v2Examples?.userSpecifiedExamples["Water"]?.request?.requestBody).toEqual({
            plantId: "fern-1",
            liters: 2
        });
        expect(endpoints["plants.prune"]?.v2Examples?.userSpecifiedExamples["Prune"]?.request?.requestBody).toEqual([
            "fern-1"
        ]);

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
            context: createMockTaskContext()
        });
        const protocols = Object.fromEntries(
            [fdrApi.rootPackage, ...Object.values(fdrApi.subpackages)]
                .flatMap((pkg) => pkg.endpoints)
                .map((endpoint) => [endpoint.originalEndpointId ?? endpoint.id, endpoint.protocol])
        );
        expect(protocols["plants.water"]).toEqual({
            type: "openrpc",
            methodName: "plants.water",
            paramStructure: "by-name"
        });
        expect(protocols["plants.prune"]).toEqual({
            type: "openrpc",
            methodName: "plants.prune",
            paramStructure: "by-position"
        });
        expect(protocols["plants.list"]).toEqual({
            type: "openrpc",
            methodName: "plants.list",
            paramStructure: undefined
        });
    }, 90_000);
});
