import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { GoFormatter } from "@fern-api/go-formatter";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/path-utils";
import { readFileSync } from "fs";

import { DynamicSnippetsGenerator } from "../DynamicSnippetsGenerator.js";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig.js";

// `type_union:Shape` is a discriminated union (discriminant `type`) whose `circle`/`square`
// variants are `samePropertiesAsObject`. Its base properties (`name`, `id`) live only on the
// union — the variant objects declare only their own props (e.g. `Circle.radius`).
const UNIONS_IR_PATH = join(
    AbsoluteFilePath.of(__dirname),
    RelativeFilePath.of(
        "../../../../../packages/cli/generation/ir-generator-tests/src/dynamic-snippets/__test__/test-definitions/unions.json"
    )
);

const SHAPE_TYPE_ID = "type_union:Shape";

// PATCH / with a `type_union:Shape` request body.
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
 * Turns `Shape` into a "carried base properties" union: copies each variant's base properties
 * (`name`, `id`) onto the variant's own object so every variant object declares them. This mirrors
 * what `infer-discriminated-union-base-properties` produces and is the shape in which the Go model
 * dedupes the top-level fields (replacing them with discriminant-switching getters).
 */
function injectBasePropertiesIntoVariantObjects(
    ir: FernIr.dynamic.DynamicIntermediateRepresentation
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
        const existing = new Set(variantObject.properties.map((property) => property.name.wireValue));
        for (const baseProperty of variant.properties) {
            if (!existing.has(baseProperty.name.wireValue)) {
                variantObject.properties.push(baseProperty);
            }
        }
    }
    return ir;
}

/**
 * Sets up the `getters-pass-by-value` drift case: every variant object carries `name`/`id` as
 * NON-optional (via {@link injectBasePropertiesIntoVariantObjects}), then makes the union's base
 * `name` OPTIONAL. With `gettersPassByValue` the model's getter for an optional field returns the
 * dereferenced type, so base `name` (`*string` -> `string`) matches the variant's `string` and the
 * model dedupes it; the snippet must apply the same `*`-stripping to agree, or it would keep `Name`
 * at the union root the model dropped (a non-compiling snippet).
 */
function setupPassByValueOptionalityMismatch(
    ir: FernIr.dynamic.DynamicIntermediateRepresentation
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
        // Give every variant object a NON-optional copy of each base property (deep-cloned so it is
        // independent of the union's base-property objects mutated below).
        const existing = new Set(variantObject.properties.map((property) => property.name.wireValue));
        for (const baseProperty of variant.properties) {
            if (!existing.has(baseProperty.name.wireValue)) {
                variantObject.properties.push(structuredClone(baseProperty));
            }
        }
        // Now make the union's base `name` optional, leaving the variant objects' `name` non-optional.
        for (const baseProperty of variant.properties) {
            if (baseProperty.name.wireValue === "name") {
                baseProperty.typeReference = { type: "optional", value: baseProperty.typeReference };
            }
        }
    }
    return ir;
}

async function generateShapeSnippet({
    ir,
    dedupeUnionBaseProperties,
    gettersPassByValue
}: {
    ir: FernIr.dynamic.DynamicIntermediateRepresentation;
    dedupeUnionBaseProperties: boolean;
    gettersPassByValue?: boolean;
}): Promise<string> {
    const generator = new DynamicSnippetsGenerator({
        ir,
        config: buildGeneratorConfig({ customConfig: { dedupeUnionBaseProperties, gettersPassByValue } }),
        formatter: new GoFormatter()
    });
    const response = await generator.generate(UPDATE_SHAPE_REQUEST, { endpointId: "endpoint_union.update" });
    return response.snippet;
}

describe("dedupeUnionBaseProperties", () => {
    it("keeps base fields at the union root when the flag is off", async () => {
        // Baseline behavior: base properties are top-level struct fields, set at the union root
        // (`Name`/`ID` sit outside the `Circle` variant literal).
        const snippet = await generateShapeSnippet({ ir: loadUnionsIr(), dedupeUnionBaseProperties: false });
        expect(snippet).toMatchInlineSnapshot(`
          "package example

          import (
          	context "context"

          	acme "github.com/acme/acme-go"
          	client "github.com/acme/acme-go/client"
          )

          func do() {
          	client := client.NewClient()
          	request := &acme.Shape{
          		Circle: &acme.Circle{
          			Radius: 1.1,
          		},
          		Name: "name",
          		ID:   "id",
          	}
          	client.Union.Update(
          		context.TODO(),
          		request,
          	)
          }
          "
        `);
    });

    it("keeps base fields at the union root when the flag is on but the variant does not carry them", async () => {
        // The Go model keeps the top-level `Name`/`ID` fields here (the variant objects only declare
        // `radius`), so the snippet must still set them at the union root or it would drop example data.
        // Output is identical to the flag-off case.
        const snippet = await generateShapeSnippet({ ir: loadUnionsIr(), dedupeUnionBaseProperties: true });
        expect(snippet).toMatchInlineSnapshot(`
          "package example

          import (
          	context "context"

          	acme "github.com/acme/acme-go"
          	client "github.com/acme/acme-go/client"
          )

          func do() {
          	client := client.NewClient()
          	request := &acme.Shape{
          		Circle: &acme.Circle{
          			Radius: 1.1,
          		},
          		Name: "name",
          		ID:   "id",
          	}
          	client.Union.Update(
          		context.TODO(),
          		request,
          	)
          }
          "
        `);
    });

    it("drops base fields from the union root when the flag is on and every variant carries them", async () => {
        // With the base properties present on every variant object, the Go model dedupes the top-level
        // fields into discriminant-switching getters, so the snippet must not set them at the union root
        // (they would reference fields that no longer exist). The values move inside the `Circle` variant.
        const snippet = await generateShapeSnippet({
            ir: injectBasePropertiesIntoVariantObjects(loadUnionsIr()),
            dedupeUnionBaseProperties: true
        });
        expect(snippet).toMatchInlineSnapshot(`
          "package example

          import (
          	context "context"

          	acme "github.com/acme/acme-go"
          	client "github.com/acme/acme-go/client"
          )

          func do() {
          	client := client.NewClient()
          	request := &acme.Shape{
          		Circle: &acme.Circle{
          			Radius: 1.1,
          			Name:   "name",
          			ID:     "id",
          		},
          	}
          	client.Union.Update(
          		context.TODO(),
          		request,
          	)
          }
          "
        `);
    });

    it("mirrors the model's getters-pass-by-value widening: dedupes an optional base prop vs a non-optional variant prop", async () => {
        // base `name` is optional, every variant object declares `name` as non-optional. With
        // `gettersPassByValue` the model's getter comparison strips the pointer (`*string` -> `string`),
        // so it dedupes `name` (and `id`, which already matches). The snippet must strip the same
        // pointer to agree — otherwise it would emit `Name` at the union root the model dropped.
        const snippet = await generateShapeSnippet({
            ir: setupPassByValueOptionalityMismatch(loadUnionsIr()),
            dedupeUnionBaseProperties: true,
            gettersPassByValue: true
        });
        expect(snippet).toMatchInlineSnapshot(`
          "package example

          import (
          	context "context"

          	acme "github.com/acme/acme-go"
          	client "github.com/acme/acme-go/client"
          )

          func do() {
          	client := client.NewClient()
          	request := &acme.Shape{
          		Circle: &acme.Circle{
          			Radius: 1.1,
          			Name:   "name",
          			ID:     "id",
          		},
          	}
          	client.Union.Update(
          		context.TODO(),
          		request,
          	)
          }
          "
        `);
    });

    it("keeps the optional base prop at the union root without getters-pass-by-value (types differ)", async () => {
        // Same shape, but with `gettersPassByValue` off the model compares `*string` (optional base)
        // against `string` (non-optional variant) — a mismatch — so it keeps `Name` at the union root.
        // `id` still matches (both non-optional) and is deduped. The snippet must match: `Name` stays at
        // the root, `ID` moves into the variant.
        const snippet = await generateShapeSnippet({
            ir: setupPassByValueOptionalityMismatch(loadUnionsIr()),
            dedupeUnionBaseProperties: true,
            gettersPassByValue: false
        });
        expect(snippet).toMatchInlineSnapshot(`
          "package example

          import (
          	context "context"

          	acme "github.com/acme/acme-go"
          	client "github.com/acme/acme-go/client"
          )

          func do() {
          	client := client.NewClient()
          	request := &acme.Shape{
          		Circle: &acme.Circle{
          			Radius: 1.1,
          			Name:   "name",
          			ID:     "id",
          		},
          		Name: acme.String(
          			"name",
          		),
          	}
          	client.Union.Update(
          		context.TODO(),
          		request,
          	)
          }
          "
        `);
    });
});
