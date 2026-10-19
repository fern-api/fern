/**
 * A discriminated union whose variants include the schema that contains it (a `Branch` whose
 * `parts` are `Leaf` or `Branch`), where each variant also declares the discriminant property.
 * The V3 importer used to inline `Branch` forever and overflow the stack.
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
        properties?: { name: string | { wireValue: string } }[];
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

describe("self-referencing discriminated union", () => {
    it("converts without recursing forever", async () => {
        const ir = await loadIr("discriminated-union-recursive");

        expect(findType(ir, "Leaf")).toBeDefined();
        const branch = findType(ir, "Branch");
        expect(branch?.shape._type).toBe("object");
        expect(
            (branch?.shape.properties ?? []).map((property) =>
                typeof property.name === "string" ? property.name : property.name.wireValue
            )
        ).toEqual(["type", "parts"]);
        expect(findType(ir, "BranchWrapper")).toBeUndefined();
        const unions = Object.values(ir.types).filter((t) => t.shape._type === "union");
        expect(unions.length).toBeGreaterThan(0);
        for (const union of unions) {
            expect(union.shape.discriminant).toBe("type");
            expect((union.shape.types ?? []).map((variant) => variant.discriminantValue)).toEqual(["Leaf", "Branch"]);
        }
    }, 60_000);
});
