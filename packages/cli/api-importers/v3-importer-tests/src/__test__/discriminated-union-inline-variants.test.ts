/**
 * A `discriminator` with no `mapping` whose `oneOf` members are inline schemas has no $refs to
 * infer a mapping from, so it cannot be converted into a discriminated union. The variants must
 * still be preserved, as an undiscriminated union, rather than collapsing to an empty union.
 *
 * Uses the V3 importer (OSSWorkspace), which is the code path for docs customers.
 */

import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

interface IRType {
    name: { name: string };
    shape: {
        _type: string;
        types?: unknown[];
        properties?: { name: string }[];
        members?: { type: { _type: string; name?: string; displayName?: string } }[];
    };
}

interface IR {
    types: Record<string, IRType>;
}

async function loadIr(fixtureName: string): Promise<IR> {
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: join(
            AbsoluteFilePath.of(__dirname),
            RelativeFilePath.of(`fixtures/${fixtureName}/fern`)
        ),
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load fixture: ${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error("Expected OSSWorkspace (V3 importer) but got a different workspace type");
    }
    const intermediateRepresentation = await workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: false,
        logWarnings: false
    });
    return JSON.parse(
        JSON.stringify(intermediateRepresentation, (_key, value) => {
            if (value && typeof value === "object" && "_visit" in value && "type" in value) {
                const { type, _visit, ...rest } = value;
                return { _type: type, ...rest };
            }
            return value;
        })
    ) as IR;
}

function findType(ir: IR, name: string): IRType | undefined {
    return Object.values(ir.types).find((t) => t.name.name === name);
}

describe("discriminator with inline oneOf variants", () => {
    it("keeps the variants instead of producing an empty union", async () => {
        const ir = await loadIr("discriminated-union-inline-variants");

        const segmentation = findType(ir, "PlantSegmentation");
        expect(segmentation?.shape._type).toBe("undiscriminatedUnion");
        expect(segmentation?.shape.members).toHaveLength(2);
        expect((segmentation?.shape.members ?? []).map((member) => member.type.displayName)).toEqual([
            "Dynamic",
            "Fixed"
        ]);
    }, 60_000);

    it("still converts a discriminator with $ref variants into a discriminated union", async () => {
        const ir = await loadIr("discriminated-union-no-mapping");

        const message = findType(ir, "Message");
        expect(message?.shape._type).toBe("union");
        expect(message?.shape.types).toHaveLength(4);
    }, 60_000);
});
