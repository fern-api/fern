import { createMockTaskContext } from "@fern-api/task-context";
import { testFernDocsResolver } from "./testFernDocsResolver";

it("should generate docs definition", () => {
    const context = createMockTaskContext();
    const project = loadProject();
    testFernDocsResolver({
        domain: "docs.buildwithfern.com",
        context,
        fernWorkspaces: [],
        docsWorkspace: {}
    });
});
