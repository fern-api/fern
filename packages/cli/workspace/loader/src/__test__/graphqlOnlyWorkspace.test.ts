import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import assert from "assert";

import { loadAPIWorkspace } from "../loadAPIWorkspace.js";

describe("GraphQL-only workspace", () => {
    it("produces an empty IR instead of throwing", async () => {
        const context = createMockTaskContext();
        const result = await loadAPIWorkspace({
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/graphql-only")),
            context,
            cliVersion: "0.0.0",
            workspaceName: undefined
        });
        assert(result.didSucceed);
        assert(result.workspace instanceof OSSWorkspace);

        const ir = await result.workspace.getIntermediateRepresentation({
            context,
            audiences: { type: "all" },
            enableUniqueErrorsPerEndpoint: true,
            generateV1Examples: false,
            logWarnings: false
        });

        expect(Object.keys(ir.services)).toEqual([]);
        expect(Object.keys(ir.types)).toEqual([]);
    });
});
