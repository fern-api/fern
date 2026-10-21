import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURE_DIR = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of("fixtures/allof-inlined-parent-metadata/fern")
);

function isObjectSchema(schema: RawSchemas.TypeDeclarationSchema | undefined): schema is RawSchemas.ObjectSchema {
    return schema != null && typeof schema === "object" && "properties" in schema;
}

function isObjectProperty(
    property: RawSchemas.ObjectPropertySchema | undefined
): property is Exclude<RawSchemas.ObjectPropertySchema, string> {
    return property != null && typeof property === "object";
}

describe("allOf inlined parent property metadata", () => {
    let types: Record<string, RawSchemas.TypeDeclarationSchema>;
    let requestProperties: Record<string, RawSchemas.ObjectPropertySchema>;

    beforeAll(async () => {
        const context = createMockTaskContext();
        const workspace = await loadAPIWorkspace({
            absolutePathToWorkspace: FIXTURE_DIR,
            context,
            cliVersion: "0.0.0",
            workspaceName: "allof-inlined-parent-metadata"
        });
        if (!workspace.didSucceed) {
            throw new Error(`Failed to load fixture: ${JSON.stringify(workspace.failures)}`);
        }
        const definition = await workspace.workspace.getDefinition({
            context,
            absoluteFilePath: AbsoluteFilePath.of("/DUMMY_PATH")
        });
        const packageFile = definition.namedDefinitionFiles[RelativeFilePath.of("__package__.yml")];
        if (packageFile == null) {
            throw new Error("Expected __package__.yml in definition");
        }
        types = packageFile.contents.types ?? {};
        const endpoint = packageFile.contents.service?.endpoints.createPlant;
        const body =
            endpoint?.request != null && typeof endpoint.request !== "string" ? endpoint.request.body : undefined;
        if (body == null || typeof body === "string" || !("properties" in body) || body.properties == null) {
            throw new Error(`Expected inlined request body properties, got ${JSON.stringify(endpoint?.request)}`);
        }
        requestProperties = body.properties;
    }, 90_000);

    describe("write request body (buildEndpoint inlining)", () => {
        it("excludes the parent's readOnly property", () => {
            expect(requestProperties).not.toHaveProperty("created_at");
        });

        it("marks the child-required parent property as required-nullable", () => {
            expect(requestProperties.nickname).toBe("nullable<string>");
        });

        it("keeps the parent's availability, audiences and xml encoding", () => {
            const legacyTag = requestProperties.legacy_tag;
            expect(isObjectProperty(legacyTag) && legacyTag.availability).toBe("deprecated");
            const internalNotes = requestProperties.internal_notes;
            expect(isObjectProperty(internalNotes) && internalNotes.audiences).toEqual(["internal"]);
            const label = requestProperties.label;
            expect(isObjectProperty(label) && label.encoding).toEqual({ xml: { name: "Label", attribute: true } });
        });
    });

    describe("response type (buildTypeDeclaration inlining)", () => {
        it("keeps the parent's readOnly property with read-only access", () => {
            const details = types.PlantDetails;
            expect(isObjectSchema(details)).toBe(true);
            if (!isObjectSchema(details)) {
                return;
            }
            expect(details.extends).toBeUndefined();
            const createdAt = details.properties?.created_at;
            expect(isObjectProperty(createdAt) && createdAt.access).toBe("read-only");
            expect(isObjectProperty(createdAt) && createdAt.type).toBe("optional<datetime>");
            expect(details.properties?.nickname).toBe("nullable<string>");
        });

        it("keeps the parent's name override, availability, audiences and xml encoding", () => {
            const details = types.PlantDetails;
            if (!isObjectSchema(details)) {
                throw new Error("PlantDetails should be an object");
            }
            const legacyTag = details.properties?.legacy_tag;
            expect(isObjectProperty(legacyTag) && legacyTag.name).toBe("legacyTag");
            expect(isObjectProperty(legacyTag) && legacyTag.availability).toBe("deprecated");
            const internalNotes = details.properties?.internal_notes;
            expect(isObjectProperty(internalNotes) && internalNotes.audiences).toEqual(["internal"]);
            const label = details.properties?.label;
            expect(isObjectProperty(label) && label.encoding).toEqual({ xml: { name: "Label", attribute: true } });
        });

        it("leaves properties required in no branch optional", () => {
            const details = types.PlantDetails;
            if (!isObjectSchema(details)) {
                throw new Error("PlantDetails should be an object");
            }
            const legacyTag = details.properties?.legacy_tag;
            expect(isObjectProperty(legacyTag) && legacyTag.type).toBe("optional<string>");
        });
    });
});
