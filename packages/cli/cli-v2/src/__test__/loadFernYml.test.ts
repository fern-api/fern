import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadFernYml } from "../config/fern-yml/loadFernYml";
import { ValidationError } from "../errors/ValidationError";

const SAMPLE_FERN_YML = `edition: 2026-01-01
org: acme

cli:
  version: 3.38.0

sdks:
  autorelease: true
  defaultGroup: public
  targets:
    node:
      lang: typescript
      version: "1.4.0"
      output:
        path: ./sdks/node
`;

describe("loadFernYml", () => {
    let testDir: AbsoluteFilePath;
    let nestedDir: AbsoluteFilePath;

    beforeEach(async () => {
        testDir = AbsoluteFilePath.of(join(tmpdir(), `fern-yml-test-${randomUUID()}`));
        nestedDir = AbsoluteFilePath.of(join(testDir, "nested", "deep"));
        await mkdir(nestedDir, { recursive: true });
        await writeFile(join(testDir, "fern.yml"), SAMPLE_FERN_YML);
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("finds fern.yml in the current directory", async () => {
        const result = await loadFernYml({ cwd: testDir });

        expect(result.sourced.edition.value).toBe("2026-01-01");
        expect(result.sourced.org.value).toBe("acme");
    });

    it("crawls up the directory tree to find fern.yml", async () => {
        const result = await loadFernYml({ cwd: nestedDir });

        expect(result.sourced.edition.value).toBe("2026-01-01");
        expect(result.sourced.org.value).toBe("acme");
    });

    it("preserves source location for the root object", async () => {
        const result = await loadFernYml({ cwd: testDir });

        expect(result.sourced.$loc.absoluteFilePath.toString()).toContain("fern.yml");
        expect(result.sourced.$loc.line).toBe(1);
        expect(result.sourced.$loc.column).toBe(1);
    });

    it("preserves source location for top-level values", async () => {
        const result = await loadFernYml({ cwd: testDir });

        expect(result.sourced.edition.$loc.line).toBe(1);
        expect(result.sourced.edition.$loc.column).toBe(10);
        expect(result.sourced.org.$loc.line).toBe(2);
        expect(result.sourced.org.$loc.column).toBe(6);
    });

    it("preserves source location for nested values", async () => {
        const result = await loadFernYml({ cwd: testDir });

        const cli = result.sourced.cli;
        expect(cli).toBeDefined();
        if (cli && "version" in cli) {
            expect(cli.version?.$loc.line).toBe(5);
        }
    });

    it("preserves source location for deeply nested values", async () => {
        const result = await loadFernYml({ cwd: testDir });

        const sdks = result.sourced.sdks;
        expect(sdks).toBeDefined();
        if (sdks && "targets" in sdks) {
            const nodeTarget = sdks.targets?.node;
            expect(nodeTarget).toBeDefined();
            expect(nodeTarget?.lang?.$loc.line).toBe(12);
        }
    });

    it("provides access to sourced values directly", async () => {
        const result = await loadFernYml({ cwd: testDir });

        // Since cli and sdks are present in the sample, we can narrow the types
        const cli = result.sourced.cli;
        expect(cli).toBeDefined();
        if (cli && !("value" in cli)) {
            expect(cli.version?.value).toBe("3.38.0");
        }

        const sdks = result.sourced.sdks;
        expect(sdks).toBeDefined();
        if (sdks && !("value" in sdks)) {
            expect(sdks.autorelease?.value).toBe(true);
            expect(sdks.defaultGroup?.value).toBe("public");
            expect(sdks.targets?.node?.lang?.value).toBe("typescript");
            expect(sdks.targets?.node?.version?.value).toBe("1.4.0");
        }
    });

    it("throws when fern.yml is not found", async () => {
        const emptyDir = AbsoluteFilePath.of(join(tmpdir(), `fern-empty-${Date.now()}`));
        await mkdir(emptyDir, { recursive: true });
        try {
            await expect(loadFernYml({ cwd: emptyDir })).rejects.toThrow("fern.yml");
        } finally {
            await rm(emptyDir, { recursive: true, force: true });
        }
    });

    describe("validation errors", () => {
        it("throws ValidationError with descriptive messages for missing required fields", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
# Missing edition and org
cli:
  version: 3.38.0
`
            );

            try {
                await loadFernYml({ cwd: testDir });
                expect.fail("Expected ValidationError to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);

                const validationError = error as ValidationError;
                expect(validationError.issues.length).toBeGreaterThanOrEqual(2);
                expect(validationError.issues[0]?.message).toContain("edition is required");
                expect(validationError.issues[1]?.message).toContain("org is required");
            }
        });

        it("provides ValidationIssue with toString() for CLI output", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    node:
      lang: 12345
`
            );

            try {
                await loadFernYml({ cwd: testDir });
                expect.fail("Expected ValidationError to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                const validationError = error as ValidationError;

                const [issue] = validationError.issues;
                if (issue == null) {
                    expect.fail("Expected at least one issue");
                }

                const issueString = issue.toString();
                expect(issueString).toBe(
                    "fern.yml:7:13: sdks.targets.node.lang must be one of: csharp, go, java, php, python, ruby, rust, swift, typescript"
                );
            }
        });

        it("provides yamlPath for validation issues", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    node:
      lang: 12345
`
            );

            try {
                await loadFernYml({ cwd: testDir });
                expect.fail("Expected ValidationError to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);

                const validationError = error as ValidationError;
                expect(validationError.issues.length).toBeGreaterThan(0);

                const [issue] = validationError.issues;
                if (issue == null) {
                    expect.fail("Expected at least one issue");
                }

                expect(issue.yamlPath).toEqual(["sdks", "targets", "node", "lang"]);
            }
        });

        it("provides source location with line and column for invalid values", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    node:
      lang: 12345
`
            );

            try {
                await loadFernYml({ cwd: testDir });
                expect.fail("Expected ValidationError to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                const validationError = error as ValidationError;
                const issueWithLocation = validationError.issues.find((i) => i.location.line > 0);
                expect(issueWithLocation).toBeDefined();
                expect(issueWithLocation?.location.line).toBeGreaterThan(0);
                expect(issueWithLocation?.location.column).toBeGreaterThan(0);
            }
        });

        it("error message is issues joined by newlines", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    node:
      lang: 12345
`
            );

            try {
                await loadFernYml({ cwd: testDir });
                expect.fail("Expected ValidationError to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                const validationError = error as ValidationError;

                const expectedMessage = validationError.issues.map((i) => i.toString()).join("\n");
                expect(validationError.message).toBe(expectedMessage);
            }
        });

        it("CLI can iterate issues and write each to stderr", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  targets:
    node:
      lang: 12345
      output:
        path: ./sdks/node
`
            );

            try {
                await loadFernYml({ cwd: testDir });
                expect.fail("Expected ValidationError to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                const validationError = error as ValidationError;

                const output: string[] = [];
                for (const issue of validationError.issues) {
                    output.push(issue.toString());
                }

                expect(output).toEqual([
                    "fern.yml:7:13: sdks.targets.node.lang must be one of: csharp, go, java, php, python, ruby, rust, swift, typescript"
                ]);
            }
        });
    });

    describe("$ref resolution", () => {
        it("resolves $ref for cli configuration", async () => {
            await writeFile(
                join(testDir, "cli.yaml"),
                `
version: 4.0.0
`
            );

            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
cli:
  $ref: "./cli.yaml"
`
            );

            const result = await loadFernYml({ cwd: testDir });

            const cli = result.sourced.cli;
            if (cli && !("value" in cli)) {
                expect(cli.version?.value).toBe("4.0.0");
            } else {
                expect.fail("Expected cli to be defined");
            }
        });

        it("resolves $ref for sdks configuration", async () => {
            await writeFile(
                join(testDir, "sdks.yaml"),
                `
autorelease: true
defaultGroup: production
targets:
  python:
    lang: python
    version: "2.0.0"
    output:
      path: ./sdks/python
`
            );

            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  $ref: "./sdks.yaml"
`
            );

            const result = await loadFernYml({ cwd: testDir });

            const sdks = result.sourced.sdks;
            if (sdks && !("value" in sdks)) {
                expect(sdks.autorelease?.value).toBe(true);
                expect(sdks.defaultGroup?.value).toBe("production");
                expect(sdks.targets?.python?.lang?.value).toBe("python");
                expect(sdks.targets?.python?.version?.value).toBe("2.0.0");
            } else {
                expect.fail("Expected sdks to be defined");
            }
        });

        it("resolves $ref for individual SDK targets", async () => {
            const targetsDir = join(testDir, "targets");
            await mkdir(targetsDir, { recursive: true });

            await writeFile(
                join(targetsDir, "typescript.yaml"),
                `
lang: typescript
version: "1.5.0"
output:
  path: ./sdks/typescript
config:
  packageName: "@acme/sdk"
`
            );

            await writeFile(
                join(targetsDir, "python.yaml"),
                `
lang: python
version: "2.1.0"
output:
  path: ./sdks/python
config:
  packageName: acme-sdk
`
            );

            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  autorelease: true
  targets:
    node:
      $ref: "./targets/typescript.yaml"
    python:
      $ref: "./targets/python.yaml"
`
            );

            const result = await loadFernYml({ cwd: testDir });

            const sdks = result.sourced.sdks;
            if (sdks && !("value" in sdks)) {
                expect(sdks.targets?.node?.lang?.value).toBe("typescript");
                expect(sdks.targets?.node?.version?.value).toBe("1.5.0");
                expect(sdks.targets?.python?.lang?.value).toBe("python");
                expect(sdks.targets?.python?.version?.value).toBe("2.1.0");
            } else {
                expect.fail("Expected sdks to be defined");
            }
        });

        it("resolves chained $ref references", async () => {
            const commonDir = join(testDir, "common");
            await mkdir(commonDir, { recursive: true });

            await writeFile(
                join(commonDir, "base-target.yaml"),
                `
lang: typescript
version: "1.0.0"
output:
  path: ./sdks/typescript
`
            );

            await writeFile(
                join(testDir, "sdk-config.yaml"),
                `
autorelease: false
targets:
  node:
    $ref: "./common/base-target.yaml"
`
            );

            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  $ref: "./sdk-config.yaml"
`
            );

            const result = await loadFernYml({ cwd: testDir });

            const sdks = result.sourced.sdks;
            if (sdks && !("value" in sdks)) {
                expect(sdks.autorelease?.value).toBe(false);
                expect(sdks.targets?.node?.lang?.value).toBe("typescript");
                expect(sdks.targets?.node?.version?.value).toBe("1.0.0");
            } else {
                expect.fail("Expected sdks to be defined");
            }
        });

        it("throws ValidationError when $ref file does not exist", async () => {
            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
cli:
  $ref: "./nonexistent.yaml"
`
            );

            try {
                await loadFernYml({ cwd: testDir });
                expect.fail("Expected ValidationError to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                const validationError = error as ValidationError;
                expect(validationError.issues.length).toBeGreaterThan(0);
                expect(validationError.issues[0]?.message).toContain("Referenced file does not exist");
            }
        });

        it("throws ValidationError when $ref has sibling keys", async () => {
            await writeFile(
                join(testDir, "cli.yaml"),
                `
version: 4.0.0
`
            );

            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
cli:
  $ref: "./cli.yaml"
  extra: invalid
`
            );

            try {
                await loadFernYml({ cwd: testDir });
                expect.fail("Expected ValidationError to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                const validationError = error as ValidationError;
                expect(validationError.issues.length).toBeGreaterThan(0);
                expect(validationError.issues[0]?.message).toContain("$ref cannot have sibling keys");
            }
        });

        it("throws ValidationError on circular $ref", async () => {
            await writeFile(
                join(testDir, "a.yaml"),
                `
autorelease: true
targets:
  node:
    $ref: "./b.yaml"
`
            );

            await writeFile(
                join(testDir, "b.yaml"),
                `
lang: typescript
config:
  nested:
    $ref: "./fern.yml"
`
            );

            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
sdks:
  $ref: "./a.yaml"
`
            );

            try {
                await loadFernYml({ cwd: testDir });
                expect.fail("Expected ValidationError to be thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                const validationError = error as ValidationError;
                expect(validationError.issues.length).toBeGreaterThan(0);
                expect(validationError.issues[0]?.message).toContain("Circular $ref detected");
            }
        });

        it("resolves multiple $ref at different levels", async () => {
            await writeFile(
                join(testDir, "cli.yaml"),
                `
version: 5.0.0
`
            );

            const targetsDir = join(testDir, "targets");
            await mkdir(targetsDir, { recursive: true });
            await writeFile(
                join(targetsDir, "go.yaml"),
                `
lang: go
version: "0.1.0"
output:
  path: ./sdks/go
`
            );

            await writeFile(
                join(testDir, "fern.yml"),
                `
edition: 2026-01-01
org: acme
cli:
  $ref: "./cli.yaml"
sdks:
  autorelease: true
  targets:
    go:
      $ref: "./targets/go.yaml"
`
            );

            const result = await loadFernYml({ cwd: testDir });

            const cli = result.sourced.cli;
            if (cli && !("value" in cli)) {
                expect(cli.version?.value).toBe("5.0.0");
            } else {
                expect.fail("Expected cli to be defined");
            }

            const sdks = result.sourced.sdks;
            if (sdks && !("value" in sdks)) {
                expect(sdks.autorelease?.value).toBe(true);
                expect(sdks.targets?.go?.lang?.value).toBe("go");
                expect(sdks.targets?.go?.version?.value).toBe("0.1.0");
            } else {
                expect.fail("Expected sdks to be defined");
            }
        });
    });
});
