import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getOriginalName } from "@fern-api/ir-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

async function getIRForFixture(fixtureName: string) {
    const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixtureName), RelativeFilePath.of("fern"));
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: fixturePath,
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load OpenAPI fixture ${fixtureName}\n${JSON.stringify(workspace.failures)}`);
    }
    if (!(workspace.workspace instanceof OSSWorkspace)) {
        throw new Error(`Expected OSSWorkspace for fixture ${fixtureName}`);
    }
    return workspace.workspace.getIntermediateRepresentation({
        context,
        audiences: { type: "all" },
        enableUniqueErrorsPerEndpoint: false,
        generateV1Examples: true,
        logWarnings: false
    });
}

describe("component schemas that are a $ref to another schema", () => {
    it("should alias the referenced named type instead of unknown", async () => {
        const ir = await getIRForFixture("ref-alias-chain");

        const aliasOf = (name: string) => {
            const type = Object.values(ir.types).find((type) => getOriginalName(type.name.name) === name);
            return type?.shape.type === "alias" ? type.shape.aliasOf : undefined;
        };

        expect(aliasOf("AgreementId")).toMatchObject({ type: "named", typeId: "ResourceId" });
        expect(aliasOf("ResourceId")).toMatchObject({ type: "named", typeId: "UUID" });
        expect(aliasOf("PlainAlias")).toMatchObject({ type: "named", typeId: "UUID" });
        expect(aliasOf("EffectiveDate")).toMatchObject({ type: "named", typeId: "LocalDateTime" });
        expect(Object.values(ir.types).find((type) => getOriginalName(type.name.name) === "EffectiveDate")?.docs).toBe(
            "The effective date."
        );
    });

    it("should not produce an alias cycle for a $ref cycle between component schemas", async () => {
        const ir = await getIRForFixture("ref-alias-chain");

        const aliasTargets = ["CycleA", "CycleB"].map((name) => {
            const type = Object.values(ir.types).find((type) => getOriginalName(type.name.name) === name);
            return type?.shape.type === "alias" && type.shape.aliasOf.type === "named"
                ? type.shape.aliasOf.typeId
                : undefined;
        });
        expect(aliasTargets).not.toEqual(["CycleB", "CycleA"]);
    });
});
