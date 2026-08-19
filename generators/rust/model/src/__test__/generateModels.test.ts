import { describe, expect, it } from "vitest";

import { generateModels } from "../generateModels.js";
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext.js";

const testDefinitions = [
    "basic-object",
    "enum-types",
    "alias-types",
    "union-types",
    "undiscriminated-union-types"
] as const;

describe.each(testDefinitions)("generateModels - %s", (testDefinitionName) => {
    it("should correctly generate model files", async () => {
        const context = await createSampleGeneratorContext(testDefinitionName);
        const files = generateModels({ context });

        // Test that files are generated
        expect(files).toBeDefined();
        expect(files.length).toBeGreaterThan(0);

        // Snapshot test for each generated file
        for (const file of files) {
            await expect(file.fileContents).toMatchFileSnapshot(`snapshots/${testDefinitionName}/${file.filename}`);
        }
    });

    it("should generate files with correct structure", async () => {
        const context = await createSampleGeneratorContext(testDefinitionName);
        const files = generateModels({ context });

        // All files should have Rust file extension
        for (const file of files) {
            expect(file.filename).toMatch(/\.rs$/);
        }

        // All files should contain valid Rust code structure
        for (const file of files) {
            expect(file.fileContents).toBeTruthy();
            expect(file.fileContents.length).toBeGreaterThan(0);
        }
    });
});

describe("generateModels type-specific tests", () => {
    it("should generate struct for basic object", async () => {
        const context = await createSampleGeneratorContext("basic-object");
        const files = generateModels({ context });

        const userFile = files.find((f) => f.filename.toLowerCase().includes("user"));
        expect(userFile).toBeDefined();
        expect(userFile?.fileContents).toContain("struct");
        expect(userFile?.fileContents).toContain("User");
    });

    it("should generate enums for enum types", async () => {
        const context = await createSampleGeneratorContext("enum-types");
        const files = generateModels({ context });

        expect(files.length).toBeGreaterThan(0);

        // Should have enum-related content
        const hasEnumContent = files.some(
            (file) =>
                file.fileContents.includes("enum") ||
                file.fileContents.includes("Color") ||
                file.fileContents.includes("Status")
        );
        expect(hasEnumContent).toBeTruthy();
    });

    it("should generate type aliases for alias types", async () => {
        const context = await createSampleGeneratorContext("alias-types");
        const files = generateModels({ context });

        expect(files.length).toBeGreaterThan(0);

        // Should have alias-related content
        const hasAliasContent = files.some(
            (file) =>
                file.fileContents.includes("type") ||
                file.fileContents.includes("UserId") ||
                file.fileContents.includes("UserProfile")
        );
        expect(hasAliasContent).toBeTruthy();
    });

    it("should generate discriminated unions for union types", async () => {
        const context = await createSampleGeneratorContext("union-types");
        const files = generateModels({ context });

        expect(files.length).toBeGreaterThan(0);

        // Should have union-related content
        const hasUnionContent = files.some(
            (file) =>
                file.fileContents.includes("pub enum") &&
                (file.fileContents.includes("Animal") ||
                    file.fileContents.includes("Vehicle") ||
                    file.fileContents.includes("Shape"))
        );
        expect(hasUnionContent).toBeTruthy();

        // Should have discriminated union attributes
        const hasTaggedUnion = files.some((file) => file.fileContents.includes("#[serde(tag ="));
        expect(hasTaggedUnion).toBeTruthy();
    });

    it("should keep the flattened wrapper for union variants that inherit properties", async () => {
        const context = await createSampleGeneratorContext("union-types");
        const files = generateModels({ context });

        // SproutedEvent has no properties of its own and WateredEvent has one, but both
        // inherit `occurred_at` from PlantEventBase. Inlining copies own properties only,
        // so these variants must keep the `#[serde(flatten)]` wrapper or the inherited
        // fields would be silently dropped from the wire payload.
        const plantEvent = files.find((file) => file.fileContents.includes("pub enum PlantEvent"));
        expect(plantEvent).toBeDefined();
        expect(plantEvent?.fileContents).toContain("data: SproutedEvent,");
        expect(plantEvent?.fileContents).toContain("data: WateredEvent,");

        // The wrapper structs must still be generated, with their inherited fields.
        const sproutedEvent = files.find((file) => file.fileContents.includes("pub struct SproutedEvent"));
        expect(sproutedEvent).toBeDefined();
        expect(sproutedEvent?.fileContents).toContain("plant_event_base_fields: PlantEventBase");

        // WateredEvent has an own property too; assert the inherited field survives alongside it,
        // since a variant that mixes own + inherited fields is the most likely to regress silently.
        const wateredEvent = files.find((file) => file.fileContents.includes("pub struct WateredEvent"));
        expect(wateredEvent).toBeDefined();
        expect(wateredEvent?.fileContents).toContain("plant_event_base_fields: PlantEventBase");
    });

    it("should preserve the payload of SSE stream-response variants that inherit via extends", async () => {
        // Regression for Anduril Lattice entities/stream: EntityStreamEvent inherits its
        // payload (time, entity) from EntityEvent via `extends` and contributes only the
        // discriminant. Pre-fix it was inlined to an empty variant (`Entity {}`), dropping
        // the inherited payload. It must keep the flattened wrapper so the payload survives.
        const context = await createSampleGeneratorContext("union-types");
        const files = generateModels({ context });

        const streamResponse = files.find((file) => file.fileContents.includes("pub enum EntityStreamResponse"));
        expect(streamResponse).toBeDefined();
        expect(streamResponse?.fileContents).toContain("data: EntityStreamEvent,");
        expect(streamResponse?.fileContents).toContain("data: EntityStreamHeartbeat,");
        // Guard against the pre-fix regression: the variants must not collapse to empty.
        expect(streamResponse?.fileContents).not.toContain("Entity {}");
        expect(streamResponse?.fileContents).not.toContain("Heartbeat {}");

        // The entity variant's wrapper must retain the inherited EntityEvent payload.
        const entityStreamEvent = files.find((file) => file.fileContents.includes("pub struct EntityStreamEvent"));
        expect(entityStreamEvent).toBeDefined();
        expect(entityStreamEvent?.fileContents).toContain("entity_event_fields: EntityEvent");
    });

    it("should generate unions for union types (all are discriminated in Fern)", async () => {
        const context = await createSampleGeneratorContext("undiscriminated-union-types");
        const files = generateModels({ context });

        expect(files.length).toBeGreaterThan(0);

        // Should have union content
        const hasUnionContent = files.some(
            (file) =>
                file.fileContents.includes("pub enum") &&
                (file.fileContents.includes("StringOrNumber") ||
                    file.fileContents.includes("FlexibleValue") ||
                    file.fileContents.includes("SearchResult"))
        );
        expect(hasUnionContent).toBeTruthy();

        // Should have tagged union attributes (Fern creates discriminated unions)
        const hasTaggedUnion = files.some((file) => file.fileContents.includes("#[serde(tag ="));
        expect(hasTaggedUnion).toBeTruthy();
    });

    it("should not apply serde(transparent) to single-property structs with enum fields", async () => {
        const context = await createSampleGeneratorContext("undiscriminated-union-types");
        const files = generateModels({ context });

        // EventPayload has a single enum-typed field and is used by EventMessage union.
        // Since EventPayload is only referenced by this one union variant, it gets inlined
        // into the EventMessage enum variant (no separate struct file is generated).
        // The inlined variant must NOT get #[serde(transparent)].
        const eventMessageFile = files.find((f) => f.filename.toLowerCase().includes("event_message"));
        expect(eventMessageFile).toBeDefined();
        expect(eventMessageFile?.fileContents).not.toContain("#[serde(transparent)]");
        // EventPayload's fields should be inlined into the Payload variant
        expect(eventMessageFile?.fileContents).toContain("Payload");
        expect(eventMessageFile?.fileContents).toContain("EventType");
        // EventPayload should NOT have a separate file since it's inlined
        const eventPayloadFile = files.find((f) => f.filename.toLowerCase().includes("event_payload"));
        expect(eventPayloadFile).toBeUndefined();
    });
});
