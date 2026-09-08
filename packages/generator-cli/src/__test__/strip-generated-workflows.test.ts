import { execFileSync } from "child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { stripGeneratedWorkflows } from "../pipeline/github/stripGeneratedWorkflows.js";
import type { PipelineLogger } from "../pipeline/PipelineLogger.js";

const logger: PipelineLogger = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };

function git(cwd: string, ...args: string[]): string {
    return execFileSync("git", args, { cwd, stdio: "pipe" }).toString().trim();
}

function write(root: string, relPath: string, content: string): void {
    mkdirSync(join(root, relPath, ".."), { recursive: true });
    writeFileSync(join(root, relPath), content);
}

describe("stripGeneratedWorkflows", () => {
    let repo: string;

    beforeEach(() => {
        repo = mkdtempSync(join(tmpdir(), "strip-workflows-"));
        git(repo, "init", "-q", "-b", "main");
        git(repo, "config", "user.name", "test");
        git(repo, "config", "user.email", "test@example.com");
    });

    afterEach(() => {
        rmSync(repo, { recursive: true, force: true });
    });

    it("removes newly generated workflows when HEAD has none, keeping other generated files", () => {
        write(repo, "README.md", "hello");
        git(repo, "add", "-A");
        git(repo, "commit", "-q", "-m", "init");

        write(repo, ".github/workflows/ci.yml", "on: push");
        write(repo, "src/client.ts", "export {}");

        stripGeneratedWorkflows(repo, logger);

        expect(existsSync(join(repo, ".github/workflows"))).toBe(false);
        expect(existsSync(join(repo, "src/client.ts"))).toBe(true);
        expect(git(repo, "status", "--porcelain")).toBe("?? src/");
    });

    it("restores tracked workflows to their HEAD contents and drops new ones", () => {
        write(repo, ".github/workflows/ci.yml", "original");
        write(repo, ".github/workflows/deploy.yml", "customer-owned");
        git(repo, "add", "-A");
        git(repo, "commit", "-q", "-m", "init");

        // Simulate generation: ci.yml rewritten, deploy.yml deleted, a new workflow added
        write(repo, ".github/workflows/ci.yml", "regenerated");
        rmSync(join(repo, ".github/workflows/deploy.yml"));
        write(repo, ".github/workflows/publish.yml", "new");
        write(repo, "src/client.ts", "export {}");

        stripGeneratedWorkflows(repo, logger);

        expect(readFileSync(join(repo, ".github/workflows/ci.yml"), "utf8")).toBe("original");
        expect(readFileSync(join(repo, ".github/workflows/deploy.yml"), "utf8")).toBe("customer-owned");
        expect(existsSync(join(repo, ".github/workflows/publish.yml"))).toBe(false);
        expect(git(repo, "status", "--porcelain")).toBe("?? src/");
    });

    it("restores workflows that were staged for deletion", () => {
        write(repo, ".github/workflows/ci.yml", "original");
        git(repo, "add", "-A");
        git(repo, "commit", "-q", "-m", "init");
        git(repo, "rm", "-rq", ".");

        stripGeneratedWorkflows(repo, logger);

        expect(readFileSync(join(repo, ".github/workflows/ci.yml"), "utf8")).toBe("original");
        expect(git(repo, "status", "--porcelain")).toBe("");
    });

    it("is a no-op safe on an empty repository without HEAD", () => {
        write(repo, ".github/workflows/ci.yml", "on: push");
        write(repo, "src/client.ts", "export {}");

        stripGeneratedWorkflows(repo, logger);

        expect(existsSync(join(repo, ".github/workflows"))).toBe(false);
        expect(existsSync(join(repo, "src/client.ts"))).toBe(true);
    });
});
