import type { Audiences } from "@fern-api/configuration";
import { APIV1Db, convertAPIDefinitionToDb, convertDbAPIDefinitionToRead, SDKSnippetHolder } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { convertIrToFdrApi } from "@fern-api/register";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
const FIXTURE_NAME = "v3-nested-inline-objects-audiences";

async function getIR(audiences: Audiences) {
    const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(FIXTURE_NAME), RelativeFilePath.of("fern"));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fixturePath,
        context,
        cliVersion: "0.0.0",
        workspaceName: FIXTURE_NAME
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load OpenAPI fixture ${FIXTURE_NAME}\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace for fixture ${FIXTURE_NAME}`);
    }
    // Mirror the `fern docs dev` / `fern check` path that the customer's report
    // originates from, including enableUniqueErrorsPerEndpoint=true.
    return workspace.workspace.getIntermediateRepresentation({
        context,
        audiences,
        enableUniqueErrorsPerEndpoint: true,
        generateV1Examples: false,
        logWarnings: false
    });
}

function asFdrTypes(ir: Awaited<ReturnType<typeof getIR>>): Record<string, unknown> {
    const snippetHolder = new SDKSnippetHolder({
        snippetsBySdkId: {},
        snippetsConfigWithSdkId: {},
        snippetTemplatesByEndpoint: {},
        snippetsBySdkIdAndEndpointId: {},
        snippetTemplatesByEndpointId: {}
    });
    const context = createMockTaskContext();
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
    const dbDef = convertAPIDefinitionToDb(fdrApi, APIV1Db.ApiDefinitionId("test-api"), snippetHolder);
    const readDef = convertDbAPIDefinitionToRead(dbDef);
    return readDef.types as Record<string, unknown>;
}

describe("nested inline objects survive audience filtering (regression)", () => {
    // The bug: when an outer schema reaches its descendants via a chain of
    // `$ref`s, only one level of descendants would be added during audience
    // filtering, leaving deeper named types unresolved and rendered as `any`
    // in the docs site.
    it("preserves transitively-referenced named types across audience filter", async () => {
        const filteredTypes = asFdrTypes(await getIR({ type: "select", audiences: ["public"] }));
        const unfilteredTypes = asFdrTypes(await getIR({ type: "all" }));

        const unfilteredKeys = Object.keys(unfilteredTypes).sort();
        const filteredKeys = Object.keys(filteredTypes).sort();

        // Every non-internal named type must survive the audience filter; the
        // bug previously dropped deeply nested $ref targets such as
        // `ItemResponseObject` and its synthetic `ItemResponseObjectData`
        // children, leaving them rendered as `any` in the docs.
        const expectedSurvivors = unfilteredKeys.filter((key) => !key.toLowerCase().includes("internal"));
        expect(
            filteredKeys,
            `expected all non-internal types to survive audience filter; got=${JSON.stringify(
                filteredKeys
            )}, expected=${JSON.stringify(expectedSurvivors)}`
        ).toEqual(expectedSurvivors);
    }, 120_000);
});
