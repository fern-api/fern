import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { loadSdkConfigV1 } from "../../generate/loadSdkConfigV1.js";
import { expandCliTarget } from "../expandCliTarget.js";
import { codes, FIXTURES, tempFolder, yaml } from "./helpers.js";

const CONTEXT = { apiName: "api", organizationName: "acme-org" };
const EXPANSION = join(FIXTURES, "expansion");

async function expandDocument(document: Record<string, unknown>) {
    const folder = await tempFolder({ "sdk-config.yml": yaml(document) });
    try {
        const loaded = await loadSdkConfigV1(join(folder.path, "sdk-config.yml"));
        return expandCliTarget(loaded.config, CONTEXT);
    } finally {
        await folder.remove();
    }
}

async function expandFixture() {
    const loaded = await loadSdkConfigV1(join(EXPANSION, "sdk-config.yml"));
    return expandCliTarget(loaded.config, CONTEXT);
}

const MINIMAL = {
    schemaVersion: "sdk-config/v1",
    sdkName: "acme",
    source: { specs: [{ id: "main", type: "openapi", path: "./openapi.yml" }] },
    output: { delivery: "files" },
    targets: [{ language: "cli" }]
};

describe("expandCliTarget", () => {
    it("selects the cli target and returns SdkConfigIrV1 with schemaVersion sdk-config-ir/v1", async () => {
        const result = await expandDocument(MINIMAL);
        expect(result.diagnostics).toEqual([]);
        expect(result.ir?.schemaVersion).toBe("sdk-config-ir/v1");
        expect(result.ir?.target.language).toBe("cli");
        expect(result.ir?.source.specs).toEqual([{ specType: "openapi", specUrl: "./openapi.yml", id: "main" }]);
    });

    it("returns RUBICON_NO_CLI_TARGET when sdk-config.yml has no cli target", async () => {
        const result = await expandDocument({ ...MINIMAL, targets: [{ language: "typescript" }] });
        expect(codes(result.diagnostics)).toEqual(["error RUBICON_NO_CLI_TARGET targets"]);
        expect(result.ir).toBeUndefined();
    });

    it("returns RUBICON_SEVERAL_CLI_TARGETS when sdk-config.yml has two cli targets", async () => {
        const result = await expandDocument({ ...MINIMAL, targets: [{ language: "cli" }, { language: "cli" }] });
        expect(codes(result.diagnostics)).toEqual(["error RUBICON_SEVERAL_CLI_TARGETS targets"]);
    });

    it("merges target package over root package, field by field", async () => {
        const { ir } = await expandFixture();
        expect(ir?.package).toMatchObject({
            packageName: "acme-cli",
            description: "Root description",
            keywords: ["cli"],
            license: { type: "MIT" }
        });
    });

    it("replaces root output with target output (not a merge)", async () => {
        const { ir } = await expandFixture();
        expect(ir?.output).toMatchObject({ delivery: "files", path: "./generated/cli" });
    });

    it("merges client and docs from root and target", async () => {
        const { ir } = await expandFixture();
        expect(ir?.client).toMatchObject({ timeoutMs: 1000, retry: { maxAttempts: 5 } });
        expect(ir?.docs.readme).toEqual({ introduction: "Root intro", apiName: "Acme CLI" });
    });

    it("splits generation into shared and cli-language settings", async () => {
        const result = await expandDocument({
            ...MINIMAL,
            generation: { wireTests: { enabled: false } },
            targets: [{ language: "cli", generation: { wireTests: { enabled: true }, skills: false } }]
        });
        expect(result.diagnostics).toEqual([]);
        expect(result.ir?.generation.wireTests?.enabled).toBe(true);
        expect(result.ir?.generation.language?.cli).toEqual({ skills: false });
    });

    it("keeps output.path and output.github.* (sdk-gen-api forces zip; rubicon does not)", async () => {
        const result = await expandDocument({
            ...MINIMAL,
            targets: [{ language: "cli", output: { delivery: "github", github: { repository: "acme/cli" } } }]
        });
        expect(result.ir?.output).toMatchObject({ delivery: "github", github: { repository: "acme/cli" } });
        expect(result.ir?.target).toMatchObject({ apiName: "api", organizationName: "acme-org" });
    });

    it("uses the root output when the target sets none", async () => {
        const result = await expandDocument({ ...MINIMAL, output: { delivery: "files", path: "./out" } });
        expect(result.ir?.output).toMatchObject({ delivery: "files", path: "./out" });
    });

    it("keeps a URL source as its URL, so the specs rule can reject it", async () => {
        const result = await expandDocument({
            ...MINIMAL,
            source: { specs: [{ id: "main", type: "openapi", url: "https://example.com/openapi.yml" }] }
        });
        expect(result.ir?.source.specs[0]?.specUrl).toBe("https://example.com/openapi.yml");
    });

    it("matches sdk-gen-api expansion for the same multi-target document, except output and source origin", async () => {
        const { ir } = await expandFixture();
        const hosted: Record<string, unknown> = JSON.parse(
            await readFile(join(EXPANSION, "sdk-gen-api-ir.json"), "utf8")
        );
        const comparable = (value: unknown): unknown => {
            const copy = JSON.parse(JSON.stringify(value));
            delete copy.output;
            delete copy.target.sourceOrigin;
            return copy;
        };
        expect(comparable(ir)).toEqual(comparable(hosted));
    });
});
