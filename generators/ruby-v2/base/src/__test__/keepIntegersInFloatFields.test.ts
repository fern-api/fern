import { Eta } from "eta";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

// `keepIntegersInFloatFields` is off by default, which keeps the `to_f` conversion of
// Integer values in `Float` fields. Turning it on must return Integer values unchanged.

const __dirname = dirname(fileURLToPath(import.meta.url));
const AS_IS_DIR = join(__dirname, "..", "asIs");

// Must match `RubyProject`'s instance, or this is not testing what ships.
const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });

function render(filename: string, keepIntegersInFloatFields: boolean): string {
    return eta.renderString(readFileSync(join(AS_IS_DIR, filename)).toString(), {
        gem_namespace: "Seed",
        sdkName: "seed",
        rootFolderName: "seed",
        custom_pager_class_name: "CustomPager",
        omitFernHeaders: false,
        includePlatformHeaders: false,
        allowUserAgentAppInfo: false,
        userAgentOnly: false,
        allowCustomHttpClient: false,
        defaultMaxRetries: 2,
        respectOptionalRequestBody: false,
        respectNullableUnionFields: false,
        serializeTimeAsIso8601: true,
        keepIntegersInFloatFields,
        omitUnsetModelFields: false,
        endpointSecurity: false,
        requestLevelMaxRetries: false
    });
}

const FLOAT_BRANCH_WITHOUT_FLAG = `          in Class if type <= Float
            case value
            when Numeric, Time, String
              return value.to_f
`;

describe("keepIntegersInFloatFields", () => {
    it("returns Integer values unchanged from the Float branch when enabled", () => {
        const rendered = render("internal/types/utils.Template.rb", true);
        expect(rendered).toContain(`          in Class if type <= Float
            case value
            when Integer
`);
        expect(rendered).not.toContain(FLOAT_BRANCH_WITHOUT_FLAG);
    });

    it("keeps the Float coercion when disabled", () => {
        const rendered = render("internal/types/utils.Template.rb", false);
        expect(rendered).toContain(FLOAT_BRANCH_WITHOUT_FLAG);
        expect(rendered).not.toContain("Whole numbers keep their Integer value");
    });

    it("decodes whole-number Symbol map keys as Integer only when enabled", () => {
        const integerFirst = `parsed = Integer(value.to_s, 10, exception: false) || Float(value.to_s, exception: false)`;
        expect(render("internal/types/utils.Template.rb", true)).toContain(integerFirst);
        const disabled = render("internal/types/utils.Template.rb", false);
        expect(disabled).not.toContain(integerFirst);
        expect(disabled).toContain(`            when Symbol
              parsed = Float(value.to_s, exception: false)
              return parsed unless parsed.nil?
`);
    });

    it("emits the matching runtime unit test", () => {
        expect(render("test/unit/internal/types/test_utils.Template.rb", true)).toContain(
            "keeps Integer values as Integer"
        );
        expect(render("test/unit/internal/types/test_utils.Template.rb", false)).toContain(
            "converts Integer values to Float"
        );
    });
});
