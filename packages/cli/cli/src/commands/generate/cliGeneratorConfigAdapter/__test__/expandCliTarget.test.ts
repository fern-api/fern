import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { loadSdkConfigV1 } from "../../loadSdkConfigV1.js";
import { expandCliTarget } from "../expandCliTarget.js";
import { codes, FIXTURES, tempFolder, yaml } from "./helpers.js";

const CONTEXT = { apiName: "api", organizationName: "acme-org" };
const EXPANSION = join(FIXTURES, "expansion");

async function expandDocument(document: Record<string, unknown>) {
    const folder = await tempFolder({ "sdk-config.yml": yaml(document) });
    try {
        const loaded = await loadSdkConfigV1(join(folder.path, "sdk-config.yml"));
        const cliIndex = loaded.config.targets.findIndex((target) => target.language === "cli");
        return expandCliTarget(loaded.config, { ...CONTEXT, npmToken: loaded.githubNpmTokens[cliIndex] });
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
    it("rejects a protobuf source, which the cli target cannot translate", async () => {
        const result = await expandDocument({
            ...MINIMAL,
            source: {
                specs: [
                    { id: "main", type: "openapi", path: "./openapi.yml" },
                    { id: "users", proto: { root: "./proto" } }
                ]
            }
        });
        expect(result.ir).toBeUndefined();
        expect(result.diagnostics).toEqual([
            expect.objectContaining({
                severity: "error",
                path: "source.specs[1]",
                code: "CLI_TARGET_PROTOBUF_SOURCE"
            })
        ]);
    });

    it("selects the cli target and returns SdkConfigIrV1 with schemaVersion sdk-config-ir/v1", async () => {
        const result = await expandDocument(MINIMAL);
        expect(result.diagnostics).toEqual([]);
        expect(result.ir?.schemaVersion).toBe("sdk-config-ir/v1");
        expect(result.ir?.target.language).toBe("cli");
        expect(result.ir?.source.specs).toEqual([{ specType: "openapi", specUrl: "./openapi.yml", id: "main" }]);
    });

    it("returns CLI_TARGET_NO_CLI_TARGET when sdk-config.yml has no cli target", async () => {
        const result = await expandDocument({ ...MINIMAL, targets: [{ language: "typescript" }] });
        expect(codes(result.diagnostics)).toEqual(["error CLI_TARGET_NO_CLI_TARGET targets"]);
        expect(result.ir).toBeUndefined();
    });

    it("returns CLI_TARGET_SEVERAL_CLI_TARGETS when sdk-config.yml has two cli targets", async () => {
        const result = await expandDocument({ ...MINIMAL, targets: [{ language: "cli" }, { language: "cli" }] });
        expect(codes(result.diagnostics)).toEqual(["error CLI_TARGET_SEVERAL_CLI_TARGETS targets"]);
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

    it("carries no other target's language settings", async () => {
        const result = await expandDocument({
            ...MINIMAL,
            targets: [
                { language: "cli", generation: { skills: false } },
                { language: "typescript", generation: { outputEsm: true } }
            ]
        });
        expect(result.diagnostics).toEqual([]);
        expect(Object.keys(result.ir?.generation.language ?? {})).toEqual(["cli"]);
    });

    it("keeps output.path and output.github.* (sdk-gen-api forces zip; the translation does not)", async () => {
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

    describe("npm publication", () => {
        function npmTarget(publish: Record<string, unknown>, delivery: Record<string, unknown> = GITHUB_DELIVERY) {
            return {
                ...MINIMAL,
                targets: [{ language: "cli", package: { packageName: "@acme/cli" }, output: { ...delivery, publish } }]
            };
        }
        const GITHUB_DELIVERY = { delivery: "github", github: { repository: "acme/cli", mode: "release" } };

        it("carries a token reference into the IR as tokenEnvironmentVariable", async () => {
            const result = await expandDocument(npmTarget({ registry: "npm", token: "${ACME_NPM_TOKEN}" }));
            expect(result.diagnostics).toEqual([]);
            expect(result.ir?.output.publish).toEqual({ registry: "npm", tokenEnvironmentVariable: "ACME_NPM_TOKEN" });
        });

        it("leaves tokenEnvironmentVariable unset without a token", async () => {
            const result = await expandDocument(npmTarget({ registry: "npm", trustedPublishing: true }));
            expect(result.ir?.output.publish).toEqual({ registry: "npm", trustedPublishing: true });
        });

        it("rejects a literal token without echoing it", async () => {
            const result = await expandDocument(npmTarget({ registry: "npm", token: "npm_literal_canary" }));
            expect(codes(result.diagnostics)).toEqual(["error CLI_TARGET_NPM_PUBLISH output.publish.token"]);
            expect(JSON.stringify(result.diagnostics)).not.toContain("npm_literal_canary");
            expect(result.ir).toBeUndefined();
        });

        it("rejects a token with trustedPublishing", async () => {
            const result = await expandDocument(
                npmTarget({ registry: "npm", trustedPublishing: true, token: "${NPM_TOKEN}" })
            );
            expect(codes(result.diagnostics)).toEqual(["error CLI_TARGET_NPM_PUBLISH output.publish.token"]);
        });

        async function expandWithOutput(output: Record<string, unknown>) {
            const folder = await tempFolder({ "sdk-config.yml": yaml(npmTarget({ registry: "npm" })) });
            try {
                const { config } = await loadSdkConfigV1(join(folder.path, "sdk-config.yml"));
                const targets = config.targets.map((target) => ({ ...target, output }));
                return expandCliTarget({ ...config, targets } as typeof config, {
                    ...CONTEXT,
                    npmToken: "${NPM_TOKEN}"
                });
            } finally {
                await folder.remove();
            }
        }

        it("is rejected by the loader without GitHub delivery", async () => {
            await expect(expandDocument(npmTarget({ registry: "npm" }, { delivery: "files" }))).rejects.toThrow(
                "requires output.delivery"
            );
        });

        it("returns an expansion error, not a crash, for publication without GitHub delivery", async () => {
            const result = await expandWithOutput({ delivery: "files", publish: { registry: "npm" } });
            expect(codes(result.diagnostics)).toEqual(["error CLI_TARGET_EXPANSION targets"]);
            expect(result.diagnostics[0]?.message).toContain('requires output.delivery \\"github\\"');
        });

        it("returns an expansion error, not a crash, for another registry", async () => {
            const result = await expandWithOutput({ ...GITHUB_DELIVERY, publish: { registry: "crates" } });
            expect(codes(result.diagnostics)).toEqual(["error CLI_TARGET_EXPANSION targets"]);
            expect(result.diagnostics[0]?.message).toContain('registry \\"crates\\" is not supported');
        });
    });
});
