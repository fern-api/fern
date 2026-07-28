import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/path-utils";
import { readFileSync } from "fs";

import { DynamicSnippetsGenerator } from "../DynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

// `type_union:Shape` is a discriminated union (discriminant `type`) whose `circle`/`square`
// variants are `samePropertiesAsObject`. Its base properties (`name`, `id`) are declared on the
// union; the variant objects declare only their own prop (e.g. `Circle.radius`). The helper below
// reshapes it into the "carried base properties" form the C# model dedupes.
const UNIONS_IR_PATH = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of(
        "../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions/unions.json"
    )
);

const SHAPE_TYPE_ID = "type_union:Shape";

// PATCH / (endpoint_union.update) with a `type_union:Shape` request body whose value is a circle
// carrying its own prop (`radius`) and the union base properties (`name`, `id`).
const UPDATE_SHAPE_REQUEST: FernIr.dynamic.EndpointSnippetRequest = {
    endpoint: { method: "PATCH", path: "/" },
    baseURL: undefined,
    environment: undefined,
    auth: undefined,
    pathParameters: undefined,
    queryParameters: undefined,
    headers: undefined,
    requestBody: { type: "circle", radius: 1.1, id: "id", name: "name" }
};

function loadUnionsIr(): FernIr.dynamic.DynamicIntermediateRepresentation {
    return JSON.parse(readFileSync(UNIONS_IR_PATH, "utf-8")) as FernIr.dynamic.DynamicIntermediateRepresentation;
}

/**
 * Reshapes `Shape` into the form the C# model dedupes: copies each variant's base properties
 * (`name`, `id`) onto the variant's own object so every variant object declares them. When
 * `markDeferred` is true, also records those wire values in the object's `deferredUnionBaseProperties`
 * — the dynamic-IR mirror of `ObjectTypeDeclaration.deferredUnionBaseProperties` that the IR generator
 * emits for exclusive union variants and that the snippet generator reads to drop the leaf fields.
 */
function reshapeShapeVariants(
    ir: FernIr.dynamic.DynamicIntermediateRepresentation,
    { markDeferred }: { markDeferred: boolean }
): FernIr.dynamic.DynamicIntermediateRepresentation {
    const shape = ir.types[SHAPE_TYPE_ID];
    if (shape?.type !== "discriminatedUnion") {
        throw new Error(`Expected ${SHAPE_TYPE_ID} to be a discriminatedUnion`);
    }
    for (const variant of Object.values(shape.types)) {
        if (variant.type !== "samePropertiesAsObject") {
            continue;
        }
        const variantObject = ir.types[variant.typeId];
        if (variantObject?.type !== "object") {
            continue;
        }
        const baseProperties = variant.properties ?? [];
        const existing = new Set(variantObject.properties.map((property) => property.name.wireValue));
        for (const baseProperty of baseProperties) {
            if (!existing.has(baseProperty.name.wireValue)) {
                variantObject.properties.push(baseProperty);
            }
        }
        if (markDeferred) {
            variantObject.deferredUnionBaseProperties = baseProperties.map((property) => property.name);
        }
    }
    return ir;
}

async function generateShapeSnippet({
    ir,
    dedupeUnionBaseProperties
}: {
    ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    dedupeUnionBaseProperties: boolean;
}) {
    const generator = new DynamicSnippetsGenerator({
        ir,
        config: buildGeneratorConfig({
            customConfig: { "dedupe-union-base-properties": dedupeUnionBaseProperties }
        })
    });
    return generator.generate(UPDATE_SHAPE_REQUEST);
}

/** Counts non-overlapping occurrences of `needle` in `haystack`. */
function countOccurrences(haystack: string, needle: string): number {
    return haystack.split(needle).length - 1;
}

describe("dedupe-union-base-properties (dynamic snippets)", () => {
    it("keeps the base fields inside the variant object when the flag is off", async () => {
        // Baseline: even though the IR marks the base properties as deferred, the flag is off, so the
        // variant leaf still declares them. The snippet sets `Name`/`ID` both inside the `Circle`
        // literal and at the union root, so each appears twice. Default output is unchanged.
        const { snippet, errors } = await generateShapeSnippet({
            ir: reshapeShapeVariants(loadUnionsIr(), { markDeferred: true }),
            dedupeUnionBaseProperties: false
        });
        expect(errors).toBeUndefined();
        expect(snippet).toContain("Radius = 1.1");
        expect(countOccurrences(snippet, "Name =")).toBe(2);
        expect(countOccurrences(snippet, "ID =")).toBe(2);
    });

    it("omits the base fields from the variant object when the flag is on", async () => {
        // With dedupe on, the C# model drops the base properties from the `Circle` leaf (they are owned
        // solely by the `Shape` envelope), so the snippet must set `Name`/`ID` only at the union root —
        // once each — while the `Circle` literal keeps only its own `Radius`.
        const { snippet, errors } = await generateShapeSnippet({
            ir: reshapeShapeVariants(loadUnionsIr(), { markDeferred: true }),
            dedupeUnionBaseProperties: true
        });
        expect(errors).toBeUndefined();
        expect(snippet).toContain("Radius = 1.1");
        expect(countOccurrences(snippet, "Name =")).toBe(1);
        expect(countOccurrences(snippet, "ID =")).toBe(1);
    });

    it("keeps the base fields when the flag is on but the IR does not defer them", async () => {
        // The decision is read from `ObjectType.deferredUnionBaseProperties`, not re-derived from the
        // flag: when the variant carries the base properties but the IR does not mark them deferred (the
        // model kept the leaf fields), the snippet must still emit them, so `Name`/`ID` appear twice.
        const { snippet, errors } = await generateShapeSnippet({
            ir: reshapeShapeVariants(loadUnionsIr(), { markDeferred: false }),
            dedupeUnionBaseProperties: true
        });
        expect(errors).toBeUndefined();
        expect(snippet).toContain("Radius = 1.1");
        expect(countOccurrences(snippet, "Name =")).toBe(2);
        expect(countOccurrences(snippet, "ID =")).toBe(2);
    });
});
