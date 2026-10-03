import { Eta } from "eta";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

// Source-level guarantees for the opt-in `allowCustomHttpClient` hook that
// `raw_client.Template.rb` emits: with the flag off nothing about `http_client`
// leaks into the generated RawClient; with it on, `send` routes every attempt
// through `perform_request`, which prefers the caller-supplied transport.

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_PATH = join(__dirname, "..", "asIs", "internal", "http", "raw_client.Template.rb");
const TEST_TEMPLATE_PATH = join(
    __dirname,
    "..",
    "asIs",
    "test",
    "unit",
    "internal",
    "http",
    "test_raw_client.Template.rb"
);

const eta = new Eta({ autoEscape: false, useWith: true, autoTrim: false });

function render(templatePath: string, allowCustomHttpClient: boolean): string {
    return eta
        .renderString(readFileSync(templatePath).toString(), {
            gem_namespace: "Seed",
            sdkName: "seed",
            rootFolderName: "seed",
            custom_pager_class_name: "CustomPager",
            omitFernHeaders: false,
            includePlatformHeaders: false,
            allowUserAgentAppInfo: false,
            allowCustomHttpClient,
            defaultMaxRetries: 2,
            endpointSecurity: false,
            requestLevelMaxRetries: false
        })
        .replace(/\{\{RETRY_STATUS_CODES_ARRAY\}\}/g, "[].freeze");
}

describe("raw_client.Template.rb allowCustomHttpClient", () => {
    it("emits no http_client hook when the flag is off", () => {
        const rendered = render(TEMPLATE_PATH, false);
        expect(rendered).not.toContain("http_client");
        expect(rendered).not.toContain("perform_request");
        expect(rendered).toContain(
            "def initialize(base_url:, max_retries: 2, timeout: 60.0, headers: {}, overridable_headers: [], auth_provider: nil)"
        );
        expect(rendered).toContain("response = conn.request(http_request)");
    });

    it("accepts and prefers a caller-supplied http_client when the flag is on", () => {
        const rendered = render(TEMPLATE_PATH, true);
        expect(rendered).toContain(
            "def initialize(base_url:, max_retries: 2, timeout: 60.0, headers: {}, overridable_headers: [], auth_provider: nil, http_client: nil)"
        );
        expect(rendered).toContain("@http_client = http_client");
        expect(rendered).toContain("response = perform_request(url, http_request)");
        expect(rendered).toContain("return @http_client.request(url, http_request) unless @http_client.nil?");
        expect(rendered).not.toContain("response = conn.request(http_request)");
    });

    it("gates the http_client unit tests on the flag", () => {
        expect(render(TEST_TEMPLATE_PATH, false)).not.toContain("custom http_client");
        expect(render(TEST_TEMPLATE_PATH, true)).toContain('describe "custom http_client"');
    });
});
