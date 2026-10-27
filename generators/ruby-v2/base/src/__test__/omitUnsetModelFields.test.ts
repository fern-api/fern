import { Eta } from "eta";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

// `Model#to_h` is emitted into the generated SDK as Ruby source, so this asserts the
// rendered template under both settings of `omitUnsetModelFields`. With the flag off,
// a required field the caller never set is sent as `null`; with it on, the field is left
// out so sparse (partial update) payloads only carry what the caller provided.

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODEL_TEMPLATE_PATH = join(__dirname, "..", "asIs", "internal", "types", "model.Template.rb");
const TEST_TEMPLATE_PATH = join(__dirname, "..", "asIs", "test", "unit", "internal", "types", "test_model.Template.rb");

// Must match `RubyProject`'s instance, or this is not testing what ships.
const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });

function render(path: string, omitUnsetModelFields: boolean): string {
    return eta.renderString(readFileSync(path).toString(), {
        gem_namespace: "Seed",
        sdkName: "seed",
        rootFolderName: "seed",
        omitUnsetModelFields
    });
}

const LEGACY_GUARD = "next if value.nil? && field.optional && (!field.nullable || !@explicit_fields&.key?(name))";
const SPARSE_GUARD = "next if value.nil? && (!@explicit_fields&.key?(name) || (field.optional && !field.nullable))";

describe("omitUnsetModelFields", () => {
    it("keeps the legacy to_h guard by default", () => {
        const rendered = render(MODEL_TEMPLATE_PATH, false);
        expect(rendered).toContain(LEGACY_GUARD);
        expect(rendered).not.toContain(SPARSE_GUARD);
        // The blank line between the guard and the value handling is preserved, so
        // flag-off model.rb is byte-identical to before the option existed.
        expect(rendered).toContain(`${LEGACY_GUARD}\n\n            if value.is_a?(::Array)`);
    });

    it("skips never-set fields, required ones included, when enabled", () => {
        const rendered = render(MODEL_TEMPLATE_PATH, true);
        expect(rendered).toContain(SPARSE_GUARD);
        expect(rendered).not.toContain(LEGACY_GUARD);
    });

    it("emits the sparse to_h unit tests only when enabled", () => {
        expect(render(TEST_TEMPLATE_PATH, false)).not.toContain("omits required fields that were never provided");
        expect(render(TEST_TEMPLATE_PATH, true)).toContain("omits required fields that were never provided");
    });
});
