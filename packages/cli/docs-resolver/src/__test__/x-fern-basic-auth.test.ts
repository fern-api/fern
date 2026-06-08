import assert from "node:assert";

import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";

import { convertIrToApiDefinition } from "../utils/convertIrToApiDefinition.js";

const context = createMockTaskContext();

it("preserves x-fern-basic auth labels for runnable endpoint API definitions", async () => {
    const workspaceResult = await loadAPIWorkspace({
        absolutePathToWorkspace: resolve(
            AbsoluteFilePath.of(__dirname),
            "../../../register/src/ir-to-fdr-converter/__test__/fixtures/x-fern-basic-auth"
        ),
        context,
        cliVersion: "0.0.0",
        workspaceName: "x-fern-basic-auth"
    });

    expect(workspaceResult.didSucceed).toBe(true);
    assert(workspaceResult.didSucceed);
    assert(workspaceResult.workspace instanceof OSSWorkspace);

    const ir = await workspaceResult.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: true,
        generateV1Examples: false,
        logWarnings: false
    });

    const apiDefinition = convertIrToApiDefinition({
        ir,
        apiDefinitionId: "x-fern-basic-auth",
        context
    });

    const basicAuth = apiDefinition.authSchemes?.["basicAuth"];
    assert(basicAuth?.type === "basicAuth");
    expect(basicAuth.usernameName).toBe("project_id");
    expect(basicAuth.passwordName).toBe("api_token");

    const endpoint = apiDefinition.rootPackage.endpoints.find((endpoint) => endpoint.id === "listPlants");
    expect(endpoint?.multiAuth).toEqual([{ schemes: ["basicAuth"] }]);

    const endpointBasicAuthId = endpoint?.multiAuth?.[0]?.schemes[0];
    expect(endpointBasicAuthId).toBe("basicAuth");

    const endpointBasicAuth = apiDefinition.authSchemes?.[endpointBasicAuthId ?? ""];
    assert(endpointBasicAuth?.type === "basicAuth");
    expect(endpointBasicAuth.usernameName).toBe("project_id");
    expect(endpointBasicAuth.passwordName).toBe("api_token");
});
