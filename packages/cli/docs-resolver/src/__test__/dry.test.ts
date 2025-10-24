import { FernNavigation } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, resolve } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadDocsWorkspace } from "@fern-api/workspace-loader";

import { DocsDefinitionResolver } from "../DocsDefinitionResolver";

const context = createMockTaskContext();

// biome-ignore lint/suspicious/noSkippedTests: allow
it.skip("converts to api reference node", async () => {
    const docsWorkspace = await loadDocsWorkspace({
        fernDirectory: resolve(AbsoluteFilePath.of(__dirname), "fixtures/dry/fern"),
        context
    });

    if (docsWorkspace == null) {
        throw new Error("Workspace is null");
    }

    const resolver = new DocsDefinitionResolver(
        "domain",
        docsWorkspace,
        [],
        [],
        context,
        undefined,
        async (_files) => [],
        async (_opts) => "",
        undefined // targetAudiences - not applicable for test
    );

    const resolved = await resolver.resolve();

    expect(resolved.pages[FernNavigation.PageId("page.mdx")]?.markdown).toMatchSnapshot();
});
