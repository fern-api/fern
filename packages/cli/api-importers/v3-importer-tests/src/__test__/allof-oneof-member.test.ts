/**
 * A oneOf used as an allOf member is a union of object variants, not a single object.
 * With `preserve-one-of-in-all-of`, the allOf is distributed over the union instead of
 * being flattened into one object with every variant's properties made optional.
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
        properties?: { name: string; valueType: { _type: string } }[];
        members?: { type: { _type: string; name?: string; typeId?: string } }[];
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

describe("oneOf as an allOf member", () => {
    it("is distributed into a union when preserve-one-of-in-all-of is enabled", async () => {
        const ir = await loadIr("allof-oneof-member");

        const exportRequest = findType(ir, "ExportRequest");
        expect(exportRequest?.shape._type).toBe("undiscriminatedUnion");
        expect(exportRequest?.shape.members).toHaveLength(3);

        // Each variant carries its own discriminating property plus the shared allOf properties.
        const variantNames = (exportRequest?.shape.members ?? []).map((member) =>
            member.type._type === "named" ? member.type.name : undefined
        );
        const variants = variantNames.map((name) => (name != null ? findType(ir, name) : undefined));
        const variantProperties = variants.map((variant) => (variant?.shape.properties ?? []).map((p) => p.name));

        expect(variantProperties).toEqual([
            ["leafId", "format", "timeout", "tag"],
            ["branchId", "format", "timeout", "tag"],
            ["format", "timeout", "tag"]
        ]);
    }, 60_000);

    it("is flattened into a single object by default", async () => {
        const ir = await loadIr("allof-oneof-member-default");

        const exportRequest = findType(ir, "ExportRequest");
        expect(exportRequest?.shape._type).toBe("object");
        expect((exportRequest?.shape.properties ?? []).map((p) => p.name)).toEqual([
            "leafId",
            "format",
            "branchId",
            "timeout",
            "tag"
        ]);
    }, 60_000);

    it("is distributed when the union member also declares type: object", async () => {
        const ir = await loadIr("allof-oneof-member");

        const typedExportRequest = findType(ir, "TypedExportRequest");
        expect(typedExportRequest?.shape._type).toBe("undiscriminatedUnion");
        expect(typedExportRequest?.shape.members).toHaveLength(2);
    }, 60_000);

    it("keeps a required declared on the parent of the allOf", async () => {
        const ir = await loadIr("allof-oneof-member");

        const taggedExportRequest = findType(ir, "TaggedExportRequest");
        expect(taggedExportRequest?.shape._type).toBe("undiscriminatedUnion");

        const firstVariantName = taggedExportRequest?.shape.members?.[0]?.type.name;
        const firstVariant = firstVariantName != null ? findType(ir, firstVariantName) : undefined;
        const tag = (firstVariant?.shape.properties ?? []).find((property) => property.name === "tag");
        expect(tag?.valueType._type).toBe("primitive");
    }, 60_000);

    it("keeps converting a oneOf in field position to a union", async () => {
        const ir = await loadIr("allof-oneof-member");
        expect(findType(ir, "Format")?.shape._type).toBe("undiscriminatedUnion");
    }, 60_000);
});
