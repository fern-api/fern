import * as fs from "fs/promises";
import jsYaml from "js-yaml";
import * as path from "path";
import { describe, expect, it } from "vitest";
import { createTempFixture } from "../../utils/createTempFixture.js";
import { runCliV2 } from "../../utils/runCliV2.js";

// Minimal fern.yml with no sdks section.
const FERN_YML_NO_SDKS = `org: test-org`;

// fern.yml with an existing typescript target.
const FERN_YML_WITH_TYPESCRIPT = `
org: test-org
api:
  specs:
    - openapi: ./openapi.yml
sdks:
  targets:
    typescript:
      output:
        path: ./sdks/typescript
`;

// Minimal stub OpenAPI spec.
const SIMPLE_OPENAPI = `
openapi: "3.0.3"
info:
  title: Test API
  version: 1.0.0
paths: {}
`;

describe("fern sdk add", () => {
    it("fails when no fern.yml exists", async () => {
        const fixture = await createTempFixture({});
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "typescript", "--yes"],
                cwd: fixture.path,
                expectError: true
            });
            expect(result.exitCode).not.toBe(0);
            expect(result.stderrPlain).toContain("fern.yml");
            expect(result.stderrPlain).toContain("fern init");
        } finally {
            await fixture.cleanup();
        }
    });

    it("fails when --target is missing", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--yes"],
                cwd: fixture.path,
                expectError: true
            });
            expect(result.exitCode).not.toBe(0);
            expect(result.stderrPlain).toContain("Missing required flags");
            expect(result.stderrPlain).toContain("--target");
        } finally {
            await fixture.cleanup();
        }
    });

    it("fails for unsupported language", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "cobol", "--yes"],
                cwd: fixture.path,
                expectError: true
            });
            expect(result.exitCode).not.toBe(0);
            expect(result.stderrPlain).toContain('"cobol" is not a supported language');
            expect(result.stderrPlain).toContain("typescript");
        } finally {
            await fixture.cleanup();
        }
    });

    it("fails for wrong casing of language", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "TypeScript", "--yes"],
                cwd: fixture.path,
                expectError: true
            });
            expect(result.exitCode).not.toBe(0);
            expect(result.stderrPlain).toContain('"TypeScript" is not a supported language');
        } finally {
            await fixture.cleanup();
        }
    });

    it("fails for invalid remote URL that is not a git URL", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "typescript", "--output", "http://example.com/repo", "--yes"],
                cwd: fixture.path,
                expectError: true
            });
            expect(result.exitCode).not.toBe(0);
            expect(result.stderrPlain).toContain("looks like a remote reference");
            expect(result.stderrPlain).toContain("https://github.com");
        } finally {
            await fixture.cleanup();
        }
    });

    it("fails when target already exists", async () => {
        const fixture = await createTempFixture({
            "fern.yml": FERN_YML_WITH_TYPESCRIPT,
            "openapi.yml": SIMPLE_OPENAPI
        });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "typescript", "--yes"],
                cwd: fixture.path,
                expectError: true
            });
            expect(result.exitCode).not.toBe(0);
            expect(result.stderrPlain).toContain("Target 'typescript' already exists");
        } finally {
            await fixture.cleanup();
        }
    });

    it("adds a target with default output path", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "python", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain("python:");
            expect(written).toContain("output: ./sdks/python");
        } finally {
            await fixture.cleanup();
        }
    });

    it("adds a target with custom output path", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "go", "--output", "./custom/go", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain("go:");
            expect(written).toContain("output: ./custom/go");
        } finally {
            await fixture.cleanup();
        }
    });

    it("adds a new target alongside an existing target", async () => {
        const fixture = await createTempFixture({
            "fern.yml": FERN_YML_WITH_TYPESCRIPT,
            "openapi.yml": SIMPLE_OPENAPI
        });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "python", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain("typescript:");
            expect(written).toContain("python:");
        } finally {
            await fixture.cleanup();
        }
    });

    it("creates sdks.targets section when absent", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "typescript", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain("sdks:");
            expect(written).toContain("targets:");
            expect(written).toContain("typescript:");
        } finally {
            await fixture.cleanup();
        }
    });

    it("adds a target with GitHub HTTPS URL", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "typescript", "--output", "https://github.com/acme/ts-sdk", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain("git:");
            expect(written).toContain("repository: https://github.com/acme/ts-sdk");
            expect(written).not.toContain("path:");
        } finally {
            await fixture.cleanup();
        }
    });

    it("adds a target with GitLab HTTPS URL", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "python", "--output", "https://gitlab.com/acme/py-sdk", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain("repository: https://gitlab.com/acme/py-sdk");
        } finally {
            await fixture.cleanup();
        }
    });

    it("adds a target with .git-suffixed URL", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "java", "--output", "https://github.com/acme/java-sdk.git", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain("repository: https://github.com/acme/java-sdk.git");
        } finally {
            await fixture.cleanup();
        }
    });

    it("adds a target with git@ SSH URL", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "go", "--output", "git@github.com:acme/go-sdk.git", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain("git:");
            expect(written).toContain("repository: git@github.com:acme/go-sdk.git");
        } finally {
            await fixture.cleanup();
        }
    });

    it("adds group when --group is specified", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "typescript", "--group", "prod", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain("group:");
            expect(written).toContain("- prod");
        } finally {
            await fixture.cleanup();
        }
    });

    it("does not add group when --group is not specified", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "go", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).not.toContain("group:");
        } finally {
            await fixture.cleanup();
        }
    });

    it("preserves existing comments when adding a new target", async () => {
        const fernYmlWithComments = `
org: test-org

# This is the API spec for our service
api:
  specs:
    - openapi: ./openapi.yml

# SDK configuration
sdks:
  # Existing target
  targets:
    typescript:
      # version pinned for stability
      output:
        path: ./sdks/typescript
`;
        const fixture = await createTempFixture({ "fern.yml": fernYmlWithComments, "openapi.yml": SIMPLE_OPENAPI });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "python", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain("# This is the API spec for our service");
            expect(written).toContain("# SDK configuration");
            expect(written).toContain("# Existing target");
            expect(written).toContain("# version pinned for stability");
            expect(written).toContain("python:");
        } finally {
            await fixture.cleanup();
        }
    });

    it("preserves inline comments when adding a new target", async () => {
        const fernYmlWithInlineComments = `org: test-org # the org name

api:
  specs:
    - openapi: ./openapi.yml

sdks:
  targets:
    typescript: # TypeScript SDK
      output:
        path: ./sdks/typescript # output directory
`;
        const fixture = await createTempFixture({
            "fern.yml": fernYmlWithInlineComments,
            "openapi.yml": SIMPLE_OPENAPI
        });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "go", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain("# the org name");
            expect(written).toContain("# TypeScript SDK");
            expect(written).toContain("# output directory");
            expect(written).toContain("go:");
        } finally {
            await fixture.cleanup();
        }
    });

    it("writes new target to $ref-referenced file", async () => {
        const fernYmlWithRef = `org: test-org

api:
  specs:
    - openapi: ./openapi.yml

sdks:
  $ref: ./sdks.yml
`;
        const sdksYmlContent = `targets:
  typescript:
    output:
      path: ./sdks/typescript
`;
        const fixture = await createTempFixture({
            "fern.yml": fernYmlWithRef,
            "sdks.yml": sdksYmlContent,
            "openapi.yml": SIMPLE_OPENAPI
        });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "python", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const sdksYmlWritten = await readFile(fixture.path, "sdks.yml");
            expect(sdksYmlWritten).toContain("python:");

            const fernYmlWritten = await readFile(fixture.path, "fern.yml");
            expect(fernYmlWritten).toContain("$ref");
            expect(fernYmlWritten).not.toContain("python:");
        } finally {
            await fixture.cleanup();
        }
    });

    it("preserves comments in $ref-referenced file", async () => {
        const fernYmlWithRef = `org: test-org

api:
  specs:
    - openapi: ./openapi.yml

sdks:
  $ref: ./sdks.yml
`;
        const sdksYmlWithComments = `# SDK targets
targets:
  # existing TypeScript SDK
  typescript:
    output:
      path: ./sdks/typescript
`;
        const fixture = await createTempFixture({
            "fern.yml": fernYmlWithRef,
            "sdks.yml": sdksYmlWithComments,
            "openapi.yml": SIMPLE_OPENAPI
        });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "go", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const sdksYmlWritten = await readFile(fixture.path, "sdks.yml");
            expect(sdksYmlWritten).toContain("# SDK targets");
            expect(sdksYmlWritten).toContain("# existing TypeScript SDK");
            expect(sdksYmlWritten).toContain("go:");
        } finally {
            await fixture.cleanup();
        }
    });

    it("fails on duplicate target in $ref-referenced file", async () => {
        const fernYmlWithRef = `org: test-org

api:
  specs:
    - openapi: ./openapi.yml

sdks:
  $ref: ./sdks.yml
`;
        const sdksYmlContent = `targets:
  python:
    output:
      path: ./sdks/python
`;
        const fixture = await createTempFixture({
            "fern.yml": fernYmlWithRef,
            "sdks.yml": sdksYmlContent,
            "openapi.yml": SIMPLE_OPENAPI
        });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "python", "--yes"],
                cwd: fixture.path,
                expectError: true
            });
            expect(result.exitCode).not.toBe(0);
            expect(result.stderrPlain).toContain("Target 'python' already exists");
        } finally {
            await fixture.cleanup();
        }
    });

    it("produces valid YAML with correct structure for local path target", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "csharp", "--output", "./sdks/csharp", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            const parsed = jsYaml.load(written) as Record<string, unknown>;
            const sdks = parsed.sdks as Record<string, unknown>;
            const targets = sdks.targets as Record<string, unknown>;
            const csharp = targets.csharp as Record<string, unknown>;
            expect(csharp.output).toBe("./sdks/csharp");
            expect(csharp.version).toBeUndefined();
            expect(csharp.group).toBeUndefined();
        } finally {
            await fixture.cleanup();
        }
    });

    it("produces valid YAML with correct structure for git target", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "ruby", "--output", "https://github.com/acme/ruby-sdk", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            const parsed = jsYaml.load(written) as Record<string, unknown>;
            const sdks = parsed.sdks as Record<string, unknown>;
            const targets = sdks.targets as Record<string, unknown>;
            const ruby = targets.ruby as Record<string, unknown>;
            const output = ruby.output as Record<string, unknown>;
            const git = output.git as Record<string, unknown>;
            expect(git.repository).toBe("https://github.com/acme/ruby-sdk");
            expect(output.path).toBeUndefined();
        } finally {
            await fixture.cleanup();
        }
    });

    it("produces valid YAML with correct group structure", async () => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", "swift", "--group", "mobile", "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            const parsed = jsYaml.load(written) as Record<string, unknown>;
            const sdks = parsed.sdks as Record<string, unknown>;
            const targets = sdks.targets as Record<string, unknown>;
            const swift = targets.swift as Record<string, unknown>;
            expect(Array.isArray(swift.group)).toBe(true);
            expect((swift.group as string[])[0]).toBe("mobile");
        } finally {
            await fixture.cleanup();
        }
    });

    it.each([
        "csharp",
        "go",
        "java",
        "php",
        "python",
        "ruby",
        "rust",
        "swift",
        "typescript"
    ])("should accept language '%s'", async (lang) => {
        const fixture = await createTempFixture({ "fern.yml": FERN_YML_NO_SDKS });
        try {
            const result = await runCliV2({
                args: ["sdk", "add", "--target", lang, "--yes"],
                cwd: fixture.path
            });
            expect(result.exitCode).toBe(0);

            const written = await readFile(fixture.path, "fern.yml");
            expect(written).toContain(`${lang}:`);
        } finally {
            await fixture.cleanup();
        }
    });
}, 60_000);

async function readFile(fixturePath: string, relPath: string): Promise<string> {
    return fs.readFile(path.join(fixturePath, relPath), "utf-8");
}
