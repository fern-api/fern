import { Eta } from "eta";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

// ──────────────────────────────────────────────────────────────────────────────
// The undiscriminated-union matcher is emitted into the generated SDK as Ruby
// source, so what matters is the rendered template. This asserts both settings
// of `respectNullableUnionFields`.
//
// Why the flag exists: the matcher checked a member's required fields against
// `optional` alone, so a field that is required AND nullable and legitimately
// arrives as `nil` read as a missing required field. The arm was rejected, no
// member matched, and the union degraded to an untyped Hash while the SDK
// documented the model.
// ──────────────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(__dirname, "..", "asIs", "internal", "types", "union.Template.rb");

// Must match `RubyProject`'s instance, or this is not testing what ships.
const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });

function render(respectNullableUnionFields: boolean): string {
    return eta.renderString(readFileSync(TEMPLATE_PATH).toString(), {
        gem_namespace: "Seed",
        sdkName: "seed",
        rootFolderName: "seed",
        custom_pager_class_name: "CustomPager",
        omitFernHeaders: false,
        includePlatformHeaders: false,
        allowUserAgentAppInfo: false,
        defaultMaxRetries: 2,
        respectOptionalRequestBody: false,
        respectNullableUnionFields,
        endpointSecurity: false,
        requestLevelMaxRetries: false
    });
}

/** The single required-field guard line, whichever form it takes. */
function guardLine(rendered: string): string {
    const line = rendered.split("\n").find((l) => l.includes("missing for union member"));
    if (line == null) {
        throw new Error("the required-field guard was not emitted");
    }
    return line;
}

describe("union matcher required-field guard", () => {
    it("checks only `optional` by default, so flag-off output is unchanged", () => {
        const line = guardLine(render(false));
        expect(line).toContain("!field.optional");
        expect(line).not.toContain("field.nullable");
    });

    it("exempts a required nullable field only when its key was present", () => {
        const line = guardLine(render(true));
        expect(line).toContain("!field.optional");
        // The exemption is conditioned on key presence, not on `nullable` alone.
        // `Model` stores nil both for an absent key and for an explicit null, so
        // checking `nullable` by itself would drop required-key validation
        // entirely and let the matcher select an arm whose required key is
        // simply missing — weakening the discrimination the guard exists for.
        expect(line).toContain("field.nullable &&");
        expect(line).toMatch(/\[field\.api_name, field\.name\]\.any\?/);
        // Presence is checked against the raw payload, not the coerced model,
        // because the coerced model cannot distinguish the two cases.
        expect(line).toContain("value.key?");
        // Both key spellings, since payload keys may be strings or symbols.
        expect(line).toContain("k.to_sym");
        expect(line).toContain("k.to_s");
    });

    it("emits one copy of the guard in both modes", () => {
        // The two branches once duplicated a long line differing only by the
        // extra predicate, which is easy to desync; the template now gates just
        // the predicate.
        for (const flag of [true, false]) {
            const occurrences = render(flag).split("missing for union member").length - 1;
            expect(occurrences).toBe(1);
        }
    });

    it("checks the api_name alias before the ruby name", () => {
        // A renamed field (`api_name`) is how the key actually arrives on the
        // wire, so it must be consulted — checking only the Ruby name would miss
        // a present key on any renamed field.
        const line = guardLine(render(true));
        expect(line.indexOf("field.api_name")).toBeLessThan(line.indexOf("field.name"));
    });
});
