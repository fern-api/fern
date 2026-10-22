import { Eta } from "eta";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

// `serializeTimeAsIso8601` is on by default. Turning it off must restore the previous
// `Time#to_s` request serialization in every request path.

const __dirname = dirname(fileURLToPath(import.meta.url));
const AS_IS_DIR = join(__dirname, "..", "asIs");

const SERIALIZED_FILES = [
    "internal/json/request.Template.rb",
    "internal/http/base_request.Template.rb",
    "internal/url_encoded/request.Template.rb",
    "internal/multipart/multipart_form_data_part.Template.rb",
    "internal/types/utils.Template.rb",
    "test/unit/internal/json/test_request.Template.rb",
    "test/unit/internal/types/test_utils.Template.rb"
];

// Must match `RubyProject`'s instance, or this is not testing what ships.
const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });

function render(filename: string, serializeTimeAsIso8601: boolean): string {
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
        serializeTimeAsIso8601,
        keepIntegersInFloatFields: true,
        endpointSecurity: false,
        requestLevelMaxRetries: false
    });
}

describe("serializeTimeAsIso8601", () => {
    it.each(SERIALIZED_FILES)("serializes times in %s only when enabled", (filename) => {
        const enabled = render(filename, true);
        const disabled = render(filename, false);
        expect(enabled).toMatch(/serialize_times|RFC 3339/);
        expect(disabled).not.toMatch(/serialize_times|RFC 3339/);
    });

    it("restores the previous request encoding when disabled", () => {
        expect(render("internal/json/request.Template.rb", false)).toContain("body.nil? ? nil : ::JSON.generate(body)");
        expect(render("internal/http/base_request.Template.rb", false)).toContain(
            "          @query.merge(additional_query)\n"
        );
        expect(render("internal/url_encoded/request.Template.rb", false)).toContain(
            "URI.encode_www_form(body.to_h.compact)"
        );
        expect(render("internal/multipart/multipart_form_data_part.Template.rb", false)).toContain(
            "          else\n            value.to_s\n"
        );
        expect(render("internal/types/utils.Template.rb", false)).toContain(
            "            snake_case.to_sym\n          end\n        end\n      end\n"
        );
    });
});
