import type { Audiences } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { describe, expect, it } from "vitest";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
const FIXTURE_NAME = "v3-inline-request-body-union-audiences";

async function getIRForFixture(audiences: Audiences) {
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
    return workspace.workspace.getIntermediateRepresentation({
        context,
        audiences,
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: true,
        logWarnings: false
    });
}

type IR = Awaited<ReturnType<typeof getIRForFixture>>;

function collectMissingTypeReferences(ir: IR): string[] {
    const missing = new Set<string>();
    const visit = (value: unknown): void => {
        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }
        if (value == null || typeof value !== "object") {
            return;
        }
        const record = value as Record<string, unknown>;
        if (record.type === "named" && typeof record.typeId === "string" && ir.types[record.typeId] == null) {
            missing.add(record.typeId);
        }
        Object.values(record).forEach(visit);
    };
    visit(ir.types);
    visit(ir.services);
    return [...missing];
}

// An inline anyOf/oneOf of inline objects on an inlined request body property must keep its
// variants under audience filtering; otherwise the union points at pruned types and renders as `any`.
describe("OpenAPI -> IR: inline request body union variants under audience filtering", () => {
    it("keeps the same types with and without the audience filter", async () => {
        const unfiltered = await getIRForFixture({ type: "all" });
        const filtered = await getIRForFixture({ type: "select", audiences: ["public"] });
        expect(Object.keys(filtered.types).sort()).toEqual(Object.keys(unfiltered.types).sort());
    }, 90_000);

    it("leaves no dangling named type references when filtering by [public]", async () => {
        const filtered = await getIRForFixture({ type: "select", audiences: ["public"] });
        expect(collectMissingTypeReferences(filtered)).toEqual([]);
    }, 90_000);
});
