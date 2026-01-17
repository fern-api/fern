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

                // Error message is all issue.toString() joined by newlines.
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

                // Simulate CLI writing each issue to stderr
                const output: string[] = [];
                for (const issue of validationError.issues) {
                    output.push(issue.toString());
                }

                expect(output).toEqual(["fern.yml:7:13: sdks.targets.node.lang must be a string"]);
            }
        });
    });
});
