import { mkdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadFernYml } from "../config/loadFernYml";
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
`;

describe("loadFernYml", () => {
    let testDir: string;
    let nestedDir: string;

    beforeEach(async () => {
        testDir = join(tmpdir(), `fern-test-${Date.now()}`);
        nestedDir = join(testDir, "nested", "deep");
        await mkdir(nestedDir, { recursive: true });
        await writeFile(join(testDir, "fern.yml"), SAMPLE_FERN_YML);
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("finds fern.yml in the current directory", async () => {
        const fernYml = await loadFernYml({ cwd: testDir });

        expect(fernYml.edition).toBe("2026-01-01");
        expect(fernYml.org).toBe("acme");
    });

    it("crawls up the directory tree to find fern.yml", async () => {
        const fernYml = await loadFernYml({ cwd: nestedDir });

        expect(fernYml.edition).toBe("2026-01-01");
        expect(fernYml.org).toBe("acme");
    });

    it("preserves source location for the root object via source property", async () => {
        const fernYml = await loadFernYml({ cwd: testDir });

        expect(fernYml.source.$loc.absoluteFilePath.toString()).toContain("fern.yml");
        expect(fernYml.source.$loc.line).toBe(1);
        expect(fernYml.source.$loc.column).toBe(1);
    });

    it("preserves source location for top-level values via source property", async () => {
        const fernYml = await loadFernYml({ cwd: testDir });

        expect(fernYml.source.edition.$loc.line).toBe(1);
        expect(fernYml.source.edition.$loc.column).toBe(10);
        expect(fernYml.source.org.$loc.line).toBe(2);
        expect(fernYml.source.org.$loc.column).toBe(6);
    });

    it("preserves source location for nested values via source property", async () => {
        const fernYml = await loadFernYml({ cwd: testDir });

        const cli = fernYml.source.cli;
        expect(cli).toBeDefined();
        if (cli && "version" in cli) {
            expect(cli.version?.$loc.line).toBe(5);
        }
    });

    it("preserves source location for deeply nested values via source property", async () => {
        const fernYml = await loadFernYml({ cwd: testDir });

        const sdks = fernYml.source.sdks;
        expect(sdks).toBeDefined();
        if (sdks && "targets" in sdks) {
            const nodeTarget = sdks.targets?.node;
            expect(nodeTarget).toBeDefined();
            expect(nodeTarget?.lang?.$loc.line).toBe(12);
        }
    });

    it("converts nested config values to plain types", async () => {
        const fernYml = await loadFernYml({ cwd: testDir });
        expect(fernYml.cli?.version).toBe("3.38.0");
        expect(fernYml.sdks?.autorelease).toBe(true);
        expect(fernYml.sdks?.defaultGroup).toBe("public");
        expect(fernYml.sdks?.targets?.node?.lang).toBe("typescript");
        expect(fernYml.sdks?.targets?.node?.version).toBe("1.4.0");
    });

    it("throws when fern.yml is not found", async () => {
        const emptyDir = join(tmpdir(), `fern-empty-${Date.now()}`);
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
                expect(issueString).toBe("fern.yml:7:13: sdks.targets.node.lang must be a string");
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

                expect(output).toEqual(["fern.yml:7:13: sdks.targets.node.lang must be a string"]);
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

            const fernYml = await loadFernYml({ cwd: testDir });

            expect(fernYml.cli?.version).toBe("4.0.0");
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

            const fernYml = await loadFernYml({ cwd: testDir });

            expect(fernYml.sdks?.autorelease).toBe(true);
            expect(fernYml.sdks?.defaultGroup).toBe("production");
            expect(fernYml.sdks?.targets?.python?.lang).toBe("python");
            expect(fernYml.sdks?.targets?.python?.version).toBe("2.0.0");
        });

        it("resolves $ref for individual SDK targets", async () => {
            const targetsDir = join(testDir, "targets");
            await mkdir(targetsDir, { recursive: true });

            await writeFile(
                join(targetsDir, "typescript.yaml"),
                `
lang: typescript
version: "1.5.0"
config:
  packageName: "@acme/sdk"
`
            );

            await writeFile(
                join(targetsDir, "python.yaml"),
                `
lang: python
version: "2.1.0"
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

            const fernYml = await loadFernYml({ cwd: testDir });

            expect(fernYml.sdks?.targets?.node?.lang).toBe("typescript");
            expect(fernYml.sdks?.targets?.node?.version).toBe("1.5.0");
            expect(fernYml.sdks?.targets?.python?.lang).toBe("python");
            expect(fernYml.sdks?.targets?.python?.version).toBe("2.1.0");
        });

        it("resolves chained $ref references", async () => {
            const commonDir = join(testDir, "common");
            await mkdir(commonDir, { recursive: true });

            await writeFile(
                join(commonDir, "base-target.yaml"),
                `
lang: typescript
version: "1.0.0"
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

            const fernYml = await loadFernYml({ cwd: testDir });

            expect(fernYml.sdks?.autorelease).toBe(false);
            expect(fernYml.sdks?.targets?.node?.lang).toBe("typescript");
            expect(fernYml.sdks?.targets?.node?.version).toBe("1.0.0");
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

            const fernYml = await loadFernYml({ cwd: testDir });

            expect(fernYml.cli?.version).toBe("5.0.0");
            expect(fernYml.sdks?.autorelease).toBe(true);
            expect(fernYml.sdks?.targets?.go?.lang).toBe("go");
            expect(fernYml.sdks?.targets?.go?.version).toBe("0.1.0");
        });
    });
});
