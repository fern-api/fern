import { access, cp, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import yaml from "js-yaml";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";

const FIXTURES_DIR = path.join(__dirname, "fixtures");
const CLI_ENV = { FERN_NO_VERSION_REDIRECTION: "true" };
const TEST_TIMEOUT = 30_000;

describe("fern sdk migrate", { timeout: TEST_TIMEOUT }, () => {
    it("migrates one language, preserves rollback YAML, and leaves docs.yml unchanged", async ({ signal }) => {
        const temporaryDirectory = await createFixture();
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        const generators = join(directory, RelativeFilePath.of("fern/generators.yml"));
        const legacy = join(directory, RelativeFilePath.of("fern/generators.legacy.yml"));
        const sdkConfig = join(directory, RelativeFilePath.of("fern/sdk-config.yml"));
        const docs = join(directory, RelativeFilePath.of("fern/docs.yml"));
        const originalDocs = await readFile(docs, "utf8");

        const command = ["sdk", "migrate", "--api", "default", "--group", "production", "--language", "typescript"];
        const result = await runFernCli(command, { cwd: directory, env: CLI_ENV, signal });

        await expect(access(generators)).rejects.toMatchObject({ code: "ENOENT" });
        const activeLegacy = yaml.load(await readFile(legacy, "utf8")) as {
            groups: { production: { generators: Array<{ name: string; version: string }> } };
        };
        expect(activeLegacy.groups.production.generators).toEqual([
            {
                name: "fernapi/fern-python-sdk",
                version: "4.3.10",
                config: {},
                output: expect.any(Object)
            }
        ]);
        const legacyText = await readFile(legacy, "utf8");
        expect(legacyText).toContain("# Migrated to ./sdk-config.yml.");
        expect(legacyText).toContain("# version: 3.63.3");
        expect(
            (yaml.load(await readFile(sdkConfig, "utf8")) as { targets: Array<{ language: string }> }).targets
        ).toMatchObject([{ language: "typescript" }]);
        expect(await readFile(docs, "utf8")).toBe(originalDocs);
        expect(result.stderr).toContain("Rollback instructions:");

        const beforeRepeat = { legacy: await readFile(legacy, "utf8"), sdkConfig: await readFile(sdkConfig, "utf8") };
        const repeated = await runFernCli(command, { cwd: directory, env: CLI_ENV, reject: false, signal });
        expect(repeated.exitCode).not.toBe(0);
        expect(await readFile(legacy, "utf8")).toBe(beforeRepeat.legacy);
        expect(await readFile(sdkConfig, "utf8")).toBe(beforeRepeat.sdkConfig);
        await temporaryDirectory.cleanup();
    });

    it("merges a later language into the existing SDK Config", async ({ signal }) => {
        const temporaryDirectory = await createFixture();
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        const common = ["sdk", "migrate", "--group", "production", "--language"];
        const generatorsPath = join(directory, RelativeFilePath.of("fern/generators.yml"));
        const generators = await readFile(generatorsPath, "utf8");
        await writeFile(
            generatorsPath,
            generators.replace(
                "              config: {}\n              output:\n                  location: local-file-system\n                  path: ./generated/python",
                "              config:\n                  client_class_name: ExampleSDK\n              output:\n                  location: local-file-system\n                  path: ./generated/python"
            )
        );

        await runFernCli([...common, "typescript"], { cwd: directory, env: CLI_ENV, signal });
        await runFernCli([...common, "python"], { cwd: directory, env: CLI_ENV, signal });

        const sdkConfig = yaml.load(
            await readFile(join(directory, RelativeFilePath.of("fern/sdk-config.yml")), "utf8")
        ) as {
            generation?: { naming?: { clientName?: string } };
            targets: Array<{ language: string; generation?: { naming?: { clientName?: string } } }>;
        };
        expect(sdkConfig.targets.map((target) => target.language)).toEqual(["typescript", "python"]);
        expect(sdkConfig.generation?.naming?.clientName).toBeUndefined();
        expect(sdkConfig.targets.find((target) => target.language === "typescript")?.generation).toBeUndefined();
        expect(sdkConfig.targets.find((target) => target.language === "python")?.generation?.naming?.clientName).toBe(
            "ExampleSDK"
        );
        const legacy = await readFile(join(directory, RelativeFilePath.of("fern/generators.legacy.yml")), "utf8");
        expect(legacy).toContain("# version: 3.63.3");
        expect(legacy).toContain("# version: 4.3.10");
        await temporaryDirectory.cleanup();
    });

    it("supports duplicate languages in separate SDK Config files", async ({ signal }) => {
        const temporaryDirectory = await createFixture();
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        const internal = join(directory, RelativeFilePath.of("fern/configs/internal-sdk-config.yml"));

        await runFernCli(["sdk", "migrate", "--group", "typescript-only", "--output", internal], {
            cwd: directory,
            env: CLI_ENV,
            signal
        });
        await runFernCli(["sdk", "migrate", "--group", "npm"], {
            cwd: directory,
            env: CLI_ENV,
            signal
        });

        const internalTargets = (yaml.load(await readFile(internal, "utf8")) as { targets: unknown[] }).targets;
        const defaultTargets = (
            yaml.load(await readFile(join(directory, RelativeFilePath.of("fern/sdk-config.yml")), "utf8")) as {
                targets: unknown[];
            }
        ).targets;
        expect(internalTargets).toHaveLength(1);
        expect(defaultTargets).toHaveLength(1);
        await temporaryDirectory.cleanup();
    });

    it("dry-runs the complete migration without changing any file", async ({ signal }) => {
        const temporaryDirectory = await createFixture();
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        const generators = join(directory, RelativeFilePath.of("fern/generators.yml"));
        const original = await readFile(generators, "utf8");

        const result = await runFernCli(
            ["sdk", "migrate", "--group", "production", "--language", "typescript", "--dry-run"],
            { cwd: directory, env: CLI_ENV, signal }
        );

        expect(result.stderr).toContain("Dry run: no files were changed.");
        expect(await readFile(generators, "utf8")).toBe(original);
        await expect(access(join(directory, RelativeFilePath.of("fern/generators.legacy.yml")))).rejects.toMatchObject({
            code: "ENOENT"
        });
        await expect(access(join(directory, RelativeFilePath.of("fern/sdk-config.yml")))).rejects.toMatchObject({
            code: "ENOENT"
        });
        await temporaryDirectory.cleanup();
    });

    it("fails before writing when an existing SDK Config has incompatible root settings", async ({ signal }) => {
        const temporaryDirectory = await createFixture();
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        const generators = join(directory, RelativeFilePath.of("fern/generators.yml"));
        const sdkConfig = join(directory, RelativeFilePath.of("fern/sdk-config.yml"));
        const originalGenerators = await readFile(generators, "utf8");
        const incompatible = `schemaVersion: sdk-config/v1
sdkName: another-api
source:
  specs:
    - id: openapi
      type: openapi
      path: ./openapi.yml
api:
  audiences: []
targets:
  - language: java
    output:
      delivery: zip
`;
        await writeFile(sdkConfig, incompatible);

        const result = await runFernCli(["sdk", "migrate", "--group", "typescript-only"], {
            cwd: directory,
            env: CLI_ENV,
            reject: false,
            signal
        });

        expect(result.exitCode).not.toBe(0);
        expect(await readFile(generators, "utf8")).toBe(originalGenerators);
        expect(await readFile(sdkConfig, "utf8")).toBe(incompatible);
        await temporaryDirectory.cleanup();
    });

    it("preserves enough source YAML to restore the original legacy generator", async ({ signal }) => {
        const temporaryDirectory = await createFixture();
        const directory = AbsoluteFilePath.of(temporaryDirectory.path);
        const generators = join(directory, RelativeFilePath.of("fern/generators.yml"));
        const legacy = join(directory, RelativeFilePath.of("fern/generators.legacy.yml"));
        const sdkConfig = join(directory, RelativeFilePath.of("fern/sdk-config.yml"));
        const original = yaml.load(await readFile(generators, "utf8")) as {
            groups: Record<string, unknown>;
        };

        await runFernCli(["sdk", "migrate", "--group", "typescript-only"], {
            cwd: directory,
            env: CLI_ENV,
            signal
        });
        await writeFile(legacy, restoreCommentedGroup(await readFile(legacy, "utf8"), "typescript-only"));
        await unlink(sdkConfig);
        await rename(legacy, generators);

        const restored = yaml.load(await readFile(generators, "utf8")) as {
            groups: Record<string, unknown>;
        };
        expect(restored.groups["typescript-only"]).toEqual(original.groups["typescript-only"]);

        const validated = await runFernCli(["sdk", "migrate", "--group", "typescript-only", "--dry-run"], {
            cwd: directory,
            env: CLI_ENV,
            signal
        });
        expect(validated.exitCode).toBe(0);
        await temporaryDirectory.cleanup();
    });
});

async function createFixture(): Promise<tmp.DirectoryResult> {
    const temporaryDirectory = await tmp.dir({ unsafeCleanup: true });
    await cp(FIXTURES_DIR, temporaryDirectory.path, { recursive: true });
    return temporaryDirectory;
}

function restoreCommentedGroup(contents: string, groupName: string): string {
    const lines = contents.split("\n");
    const headerStart = lines.findIndex((line) => line.includes(`# Group '${groupName}' migrated to `));
    if (headerStart < 0) {
        throw new Error(`Migration comment for group '${groupName}' was not found.`);
    }
    const blockStart = headerStart + 4;
    let blockEnd = blockStart;
    while (blockEnd < lines.length && !/^ {4}[^#\s].*:/.test(lines[blockEnd] ?? "")) {
        blockEnd++;
    }
    const restored = lines.slice(blockStart, blockEnd).map((line) => line.replace(/^(\s*)# ?/, "$1"));
    lines.splice(headerStart, blockEnd - headerStart, ...restored);
    return lines.join("\n");
}
