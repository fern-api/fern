/**
 * A `discriminator` with no `mapping` whose `oneOf` members are inline schemas: the discriminant
 * values come from each member's literal discriminant property, rather than from $refs, and the
 * variants must not be dropped.
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
        discriminant?: string;
        types?: { discriminantValue: string; displayName?: string }[];
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
    it("infers the variants from their literal discriminant property", async () => {
        const ir = await loadIr("discriminated-union-inline-variants");

        const segmentation = findType(ir, "PlantSegmentation");
        expect(segmentation?.shape._type).toBe("union");
        expect(segmentation?.shape.discriminant).toBe("strategy");
        expect((segmentation?.shape.types ?? []).map((variant) => variant.discriminantValue)).toEqual([
            "dynamic",
            "fixed"
        ]);
        expect((segmentation?.shape.types ?? []).map((variant) => variant.displayName)).toEqual(["Dynamic", "Fixed"]);
    }, 60_000);

    it("still converts a discriminator with $ref variants into a discriminated union", async () => {
        const ir = await loadIr("discriminated-union-no-mapping");

        const message = findType(ir, "Message");
        expect(message?.shape._type).toBe("union");
        expect(message?.shape.types).toHaveLength(4);
    }, 60_000);
});
