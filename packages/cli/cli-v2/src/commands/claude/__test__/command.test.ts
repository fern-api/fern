import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createTestContextWithCapture } from "../../../__test__/utils/createTestContext.js";
import { InstallCommand } from "../install/command.js";
import { SkillsCommand } from "../skills/command.js";
import { StatusCommand } from "../status/command.js";

// chalk wraps strings with ANSI escapes around the underlying text, so
// `toContain("text")` matches without stripping. We do still need to JSON.parse
// the `--json` outputs, but those bypass chalk entirely.
describe("fern claude", () => {
  let testDir: AbsoluteFilePath;

  beforeEach(async () => {
    testDir = AbsoluteFilePath.of(
      join(tmpdir(), `fern-claude-test-${randomUUID()}`),
    );
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe("install", () => {
    it("prints the slash commands needed to install the plugin", async () => {
      const { context, getStdout } = await createTestContextWithCapture({
        cwd: testDir,
      });
      const cmd = new InstallCommand();

      await cmd.handle(context, { "log-level": "info", json: false });

      const output = getStdout();
      expect(output).toContain("/plugin marketplace add fern-api/fern");
      expect(output).toContain("/plugin install fern@fern-api");
    });

    it("emits JSON metadata when --json is passed", async () => {
      const { context, getStdout } = await createTestContextWithCapture({
        cwd: testDir,
      });
      const cmd = new InstallCommand();

      await cmd.handle(context, { "log-level": "info", json: true });

      const parsed = JSON.parse(getStdout());
      expect(parsed.marketplace.repo).toBe("fern-api/fern");
      expect(parsed.marketplace.name).toBe("fern-api");
      expect(parsed.plugin.name).toBe("fern");
      expect(parsed.commands).toEqual([
        "/plugin marketplace add fern-api/fern",
        "/plugin install fern@fern-api",
      ]);
      expect(parsed.skills).toContain("init-fern-project");
    });
  });

  describe("status", () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
      process.env = { ...originalEnv };
    });

    it("reports 'not in Claude Code session' when env vars are absent", async () => {
      delete process.env["CLAUDECODE"];
      delete process.env["CLAUDE_CODE_ENTRYPOINT"];

      const { context, getStdout } = await createTestContextWithCapture({
        cwd: testDir,
      });
      const cmd = new StatusCommand();

      await cmd.handle(context, { "log-level": "info", json: false });

      const output = getStdout();
      expect(output).toContain("Not running inside a Claude Code session");
      expect(output).toContain("/plugin marketplace add fern-api/fern");
    });

    it("reports 'in Claude Code session' when CLAUDECODE=1", async () => {
      process.env["CLAUDECODE"] = "1";
      process.env["CLAUDE_CODE_ENTRYPOINT"] = "cli";

      const { context, getStdout } = await createTestContextWithCapture({
        cwd: testDir,
      });
      const cmd = new StatusCommand();

      await cmd.handle(context, { "log-level": "info", json: false });

      const output = getStdout();
      expect(output).toContain("Running inside a Claude Code session");
      expect(output).toContain("(cli)");
    });

    it("emits JSON when --json is passed", async () => {
      delete process.env["CLAUDECODE"];
      delete process.env["CLAUDE_CODE_ENTRYPOINT"];

      const { context, getStdout } = await createTestContextWithCapture({
        cwd: testDir,
      });
      const cmd = new StatusCommand();

      await cmd.handle(context, { "log-level": "info", json: true });

      const parsed = JSON.parse(getStdout());
      expect(parsed.inClaudeCodeSession).toBe(false);
      expect(parsed.plugin.name).toBe("fern");
      expect(parsed.skillCount).toBeGreaterThan(0);
    });
  });

  describe("skills", () => {
    it("lists every shipped skill with its description", async () => {
      const { context, getStdout } = await createTestContextWithCapture({
        cwd: testDir,
      });
      const cmd = new SkillsCommand();

      await cmd.handle(context, { "log-level": "info", json: false });

      const output = getStdout();
      expect(output).toContain("init-fern-project");
      expect(output).toContain("generate-sdk");
      expect(output).toContain("scaffold-docs-site");
      expect(output).toContain("check-fern-config");
      expect(output).toContain("preview-docs");
    });

    it("emits a JSON skills array when --json is passed", async () => {
      const { context, getStdout } = await createTestContextWithCapture({
        cwd: testDir,
      });
      const cmd = new SkillsCommand();

      await cmd.handle(context, { "log-level": "info", json: true });

      const parsed = JSON.parse(getStdout());
      expect(Array.isArray(parsed.skills)).toBe(true);
      expect(parsed.skills.length).toBeGreaterThanOrEqual(5);
      for (const skill of parsed.skills) {
        expect(typeof skill.name).toBe("string");
        expect(typeof skill.description).toBe("string");
      }
    });
  });
});
