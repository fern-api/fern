/**
 * A oneOf whose branches only list which sibling `properties` must be present
 * (e.g. `oneOf: [{ required: [domain] }, { required: [phone] }]`) is an
 * "exactly one of" constraint over the declared object, not a set of variants.
 * The declared properties must survive conversion instead of being dropped.
 *
 * Uses the V3 importer (OSSWorkspace).
 */

import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

interface IRProperty {
    name: string;
    valueType: { _type: string };
}

interface IRType {
    name: { name: string };
    shape: {
        _type: string;
        properties?: IRProperty[];
        members?: unknown[];
    };
}

interface IREndpoint {
    name: string;
    requestBody?: { _type: string; requestBodyType?: { name?: string } };
}

interface IR {
    types: Record<string, IRType>;
    services: Record<string, { endpoints: IREndpoint[] }>;
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

function findEndpoint(ir: IR, name: string): IREndpoint | undefined {
    return Object.values(ir.services)
        .flatMap((service) => service.endpoints)
        .find((endpoint) => endpoint.name === name);
}

function propertyNames(properties: IRProperty[] | undefined): string[] {
    return (properties ?? []).map((property) => property.name);
}

describe("sibling oneOf of required-only branches", () => {
    it("keeps the properties of an inline allOf member", async () => {
        const ir = await loadIr("allof-sibling-oneof-required");

        const listRoutesBody = findEndpoint(ir, "listRoutes")?.requestBody;
        expect(listRoutesBody?._type).toBe("reference");
        expect(listRoutesBody?.requestBodyType?.name).toBe("InboundRoutesRequest");

        const inboundRoutesRequest = findType(ir, "InboundRoutesRequest");
        expect(inboundRoutesRequest?.shape._type).toBe("object");
        expect(propertyNames(inboundRoutesRequest?.shape.properties)).toEqual(["key", "domain", "phone"]);

        const inboundAddRouteRequest = findType(ir, "InboundAddRouteRequest");
        expect(inboundAddRouteRequest?.shape._type).toBe("object");
        expect(propertyNames(inboundAddRouteRequest?.shape.properties)).toEqual([
            "key",
            "domain",
            "phone",
            "pattern",
            "url"
        ]);

        // `url` is required by every branch so it stays required; the rest are
        // only required by some branch and become optional.
        const alwaysRequired = new Set(["key", "url"]);
        for (const property of inboundAddRouteRequest?.shape.properties ?? []) {
            expect(property.valueType._type).toBe(alwaysRequired.has(property.name) ? "primitive" : "container");
        }
    }, 60_000);

    it("converts a standalone schema as an object", async () => {
        const ir = await loadIr("allof-sibling-oneof-required");

        const contact = findType(ir, "Contact");
        expect(contact?.shape._type).toBe("object");
        expect(propertyNames(contact?.shape.properties)).toEqual(["email", "phone"]);
    }, 60_000);

    it("keeps a oneOf whose branches narrow a property as a union", async () => {
        const ir = await loadIr("allof-sibling-oneof-required");

        const shape = findType(ir, "Shape");
        expect(shape?.shape._type).toBe("undiscriminatedUnion");
        expect(shape?.shape.members).toHaveLength(2);
    }, 60_000);

    it("keeps a single-branch constraint's properties required", async () => {
        const ir = await loadIr("allof-sibling-oneof-required");

        const single = findType(ir, "SingleBranch");
        expect(single?.shape._type).toBe("object");
        expect((single?.shape.properties ?? []).map((p) => [p.name, p.valueType._type])).toEqual([
            ["a", "primitive"],
            ["b", "container"]
        ]);
    }, 60_000);

    it("keeps a oneOf as a union when a branch has other constraints or is explicitly discriminated", async () => {
        const ir = await loadIr("allof-sibling-oneof-required");

        expect(findType(ir, "WithNot")?.shape._type).toBe("undiscriminatedUnion");
        expect(findType(ir, "ExplicitlyDiscriminated")?.shape._type).toBe("undiscriminatedUnion");
    }, 60_000);
});
