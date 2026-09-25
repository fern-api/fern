/**
 * A user-supplied example for a `oneOf` must be converted against the variant its
 * discriminator property selects, even when the spec has no formal `discriminator:` block
 * and the discriminator is only inferred from each variant's single-value `enum` / `const`.
 *
 * Previously every example was coerced into the first variant, so an example with
 * `.tag: folder` came out with `.tag: file` and the folder's payload.
 *
 * The fixture also routes a property through a `$ref` -> `$ref` chain, which used to make the
 * correct variant fail validation and fall back to the coerced first variant.
 */

import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

interface V2Example {
    response?: { body?: { value?: unknown } };
}

async function getResponseBodies(fixtureName: string): Promise<unknown[]> {
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: join(FIXTURES_DIR, RelativeFilePath.of(fixtureName), RelativeFilePath.of("fern")),
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load fixture: ${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error("Expected OSSWorkspace (V3 importer)");
    }
    const ir = await workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        logWarnings: false
    });
    const endpoint = Object.values(ir.services)[0]?.endpoints[0];
    if (endpoint?.v2Examples == null) {
        throw new Error("Expected endpoint with v2Examples");
    }
    const examples = Object.values(endpoint.v2Examples.userSpecifiedExamples) as V2Example[];
    return examples.map((example) => example.response?.body?.value);
}

describe("oneOf examples with an inferred discriminator", () => {
    it("keeps each user-specified example on the variant selected by its discriminator", async () => {
        const bodies = await getResponseBodies("oneof-example-discriminator");

        expect(bodies).toHaveLength(3);
        expect(bodies[0]).toMatchObject({ ".tag": "file", name: "Prime_Numbers.txt", size: 7212 });
        expect(bodies[1]).toMatchObject({
            ".tag": "folder",
            name: "math",
            sharing_info: { read_only: false, parent_shared_folder_id: "84528192421" }
        });
        expect(bodies[1]).not.toHaveProperty("size");
        expect(bodies[2]).toMatchObject({ ".tag": "deleted", name: "old.txt" });
        expect(bodies[2]).not.toHaveProperty("id");
    });
});
