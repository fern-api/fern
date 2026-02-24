import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { parseDocument } from "yaml";
import { AddCommand } from "../../../../commands/sdk/add/command.js";
import { isGitUrl } from "../../../../commands/sdk/utils/gitUrl.js";
import { isRemoteReference } from "../../../../commands/sdk/utils/isRemoteReference.js";

describe("fern sdk add", () => {
    let testDir: string;

    beforeEach(async () => {
        testDir = join(tmpdir(), `fern-sdk-add-test-${randomUUID()}`);
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    describe("isGitUrl", () => {
        it("recognizes .git suffix", () => {
            expect(isGitUrl("https://github.com/owner/repo.git")).toBe(true);
        });

        it("recognizes https://github.com/ prefix", () => {
            expect(isGitUrl("https://github.com/owner/repo")).toBe(true);
        });

        it("recognizes https://gitlab.com/ prefix", () => {
            expect(isGitUrl("https://gitlab.com/owner/repo")).toBe(true);
        });

        it("recognizes git@ prefix", () => {
            expect(isGitUrl("git@github.com:owner/repo.git")).toBe(true);
        });

        it("rejects local paths", () => {
            expect(isGitUrl("./sdks/typescript")).toBe(false);
            expect(isGitUrl("/absolute/path")).toBe(false);
            expect(isGitUrl("relative/path")).toBe(false);
        });
    });

    describe("isRemoteReference", () => {
        it("detects http:// URLs", () => {
            expect(isRemoteReference("http://example.com/repo")).toBe(true);
        });

        it("detects https:// URLs", () => {
            expect(isRemoteReference("https://example.com/repo")).toBe(true);
        });

        it("detects ssh:// URLs", () => {
            expect(isRemoteReference("ssh://git@example.com/repo")).toBe(true);
        });

        it("detects user@host:path patterns", () => {
            expect(isRemoteReference("user@host:path")).toBe(true);
        });

        it("rejects local paths", () => {
            expect(isRemoteReference("./sdks/typescript")).toBe(false);
            expect(isRemoteReference("/absolute/path")).toBe(false);
        });
    });

    describe("comment preservation", () => {
        it("preserves inline comments when adding a target", async () => {
            const fernYmlPath = join(testDir, "fern.yml");
            const originalContent = [
                "edition: 2026-01-01",
                "org: acme # organization name",
                "api:",
                "  path: ./openapi.yaml",
                "sdks:",
                "  targets:",
                "    typescript: # existing target",
                "      output:",
                "        path: ./sdks/typescript",
                ""
            ].join("\n");

            await writeFile(fernYmlPath, originalContent, "utf-8");

            // Simulate what addTargetToFernYml does: parse, add target, write
            const content = await readFile(fernYmlPath, "utf-8");
            const document = parseDocument(content);

            const newTarget = { output: { path: "./sdks/python" } };
            document.setIn(["sdks", "targets", "python"], document.createNode(newTarget));

            const result = document.toString();
            await writeFile(fernYmlPath, result, "utf-8");

            // Verify comments are preserved
            expect(result).toContain("# organization name");
            expect(result).toContain("# existing target");

            // Verify the new target was added
            expect(result).toContain("python:");
            expect(result).toContain("./sdks/python");
        });

        it("preserves block comments when adding a target", async () => {
            const fernYmlPath = join(testDir, "fern.yml");
            const originalContent = [
                "# This is the main configuration file",
                "edition: 2026-01-01",
                "org: acme",
                "# SDK configuration section",
                "sdks:",
                "  targets:",
                "    typescript:",
                "      output:",
                "        path: ./sdks/typescript",
                ""
            ].join("\n");

            await writeFile(fernYmlPath, originalContent, "utf-8");

            const content = await readFile(fernYmlPath, "utf-8");
            const document = parseDocument(content);

            const newTarget = { output: { path: "./sdks/go" } };
            document.setIn(["sdks", "targets", "go"], document.createNode(newTarget));

            const result = document.toString();

            // Verify block comments are preserved
            expect(result).toContain("# This is the main configuration file");
            expect(result).toContain("# SDK configuration section");

            // Verify the new target was added
            expect(result).toContain("go:");
            expect(result).toContain("./sdks/go");
        });
    });

    describe("$ref resolution", () => {
        it("follows $ref and edits the referenced file", async () => {
            // Create fern.yml with a $ref for sdks
            const fernYmlPath = join(testDir, "fern.yml");
            const sdksYmlPath = join(testDir, "sdks.yml");

            await writeFile(
                fernYmlPath,
                [
                    "edition: 2026-01-01",
                    "org: acme",
                    "api:",
                    "  path: ./openapi.yaml",
                    "sdks:",
                    "  $ref: sdks.yml"
                ].join("\n"),
                "utf-8"
            );

            await writeFile(
                sdksYmlPath,
                ["targets:", "  typescript:", "    output:", "      path: ./sdks/typescript"].join("\n"),
                "utf-8"
            );

            // Parse fern.yml and check for $ref
            const fernContent = await readFile(fernYmlPath, "utf-8");
            const fernDoc = parseDocument(fernContent);
            const fernJs = fernDoc.toJS() as Record<string, unknown>;
            const sdksValue = fernJs.sdks as Record<string, unknown>;

            expect(sdksValue).toBeDefined();
            expect("$ref" in sdksValue).toBe(true);
            expect(sdksValue["$ref"]).toBe("sdks.yml");

            // Parse the referenced file and add a target
            const sdksContent = await readFile(sdksYmlPath, "utf-8");
            const sdksDoc = parseDocument(sdksContent);

            const newTarget = { output: { path: "./sdks/python" } };
            sdksDoc.setIn(["targets", "python"], sdksDoc.createNode(newTarget));

            await writeFile(sdksYmlPath, sdksDoc.toString(), "utf-8");

            // Verify the referenced file was updated
            const updatedSdksContent = await readFile(sdksYmlPath, "utf-8");
            expect(updatedSdksContent).toContain("python:");
            expect(updatedSdksContent).toContain("./sdks/python");

            // Verify the main fern.yml was NOT modified
            const updatedFernContent = await readFile(fernYmlPath, "utf-8");
            expect(updatedFernContent).toBe(fernContent);
        });
    });

    describe("duplicate target detection", () => {
        it("detects an existing target in the YAML document", async () => {
            const fernYmlPath = join(testDir, "fern.yml");
            await writeFile(
                fernYmlPath,
                [
                    "edition: 2026-01-01",
                    "org: acme",
                    "sdks:",
                    "  targets:",
                    "    typescript:",
                    "      output:",
                    "        path: ./sdks/typescript"
                ].join("\n"),
                "utf-8"
            );

            const content = await readFile(fernYmlPath, "utf-8");
            const document = parseDocument(content);
            const targetsJs = document.toJS() as Record<string, unknown>;
            const sdks = targetsJs.sdks as Record<string, unknown> | undefined;
            const targets = sdks?.targets as Record<string, unknown> | undefined;

            expect(targets).toBeDefined();
            expect("typescript" in (targets ?? {})).toBe(true);
            expect("python" in (targets ?? {})).toBe(false);
        });
    });

    describe("target building", () => {
        it("creates target node with version, output path, and group", async () => {
            const document = parseDocument("");

            const newTarget: Record<string, unknown> = {};
            newTarget.version = "1.0.0";
            newTarget.output = { path: "./sdks/go" };
            newTarget.group = ["staging"];

            document.set("targets", document.createNode({ go: newTarget }));

            const result = document.toString();
            expect(result).toContain("version: 1.0.0");
            expect(result).toContain("path: ./sdks/go");
            expect(result).toContain("group:");
            expect(result).toContain("- staging");
        });

        it("creates target node with git output", async () => {
            const document = parseDocument("");

            const newTarget: Record<string, unknown> = {};
            newTarget.output = {
                git: { repository: "https://github.com/owner/repo" }
            };

            document.set("targets", document.createNode({ typescript: newTarget }));

            const result = document.toString();
            expect(result).toContain("repository: https://github.com/owner/repo");
        });

        it("creates target node without version when not specified", async () => {
            const document = parseDocument("");

            const newTarget: Record<string, unknown> = {};
            newTarget.output = { path: "./sdks/python" };

            document.set("targets", document.createNode({ python: newTarget }));

            const result = document.toString();
            expect(result).not.toContain("version:");
            expect(result).toContain("path: ./sdks/python");
        });
    });

    describe("parseLanguage validation", () => {
        it("accepts all supported languages", () => {
            const supported = ["csharp", "go", "java", "php", "python", "ruby", "rust", "swift", "typescript"];
            const cmd = new AddCommand();
            // Access the private parseLanguage method via prototype
            const parseLanguage = (cmd as unknown as { parseLanguage: (target: string) => string }).parseLanguage.bind(
                cmd
            );
            for (const lang of supported) {
                expect(parseLanguage(lang)).toBe(lang);
            }
        });

        it("rejects unsupported languages", () => {
            const cmd = new AddCommand();
            const parseLanguage = (cmd as unknown as { parseLanguage: (target: string) => string }).parseLanguage.bind(
                cmd
            );
            expect(() => parseLanguage("kotlin")).toThrow();
            expect(() => parseLanguage("dart")).toThrow();
            expect(() => parseLanguage("")).toThrow();
        });
    });

    describe("ensureMapPath", () => {
        it("creates intermediate maps when they do not exist", () => {
            const document = parseDocument("edition: 2026-01-01\n");

            // Use the ensureMapPath-like logic
            const path = ["sdks", "targets"];
            for (let i = 1; i <= path.length; i++) {
                const subPath = path.slice(0, i);
                const existing = document.getIn(subPath);
                if (existing == null) {
                    document.setIn(subPath, document.createNode({}));
                }
            }

            const result = document.toString();
            expect(result).toContain("sdks:");
            expect(result).toContain("targets:");
        });
    });
});
