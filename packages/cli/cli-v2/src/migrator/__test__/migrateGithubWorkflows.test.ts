import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { randomUUID } from "crypto";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { migrateGithubWorkflows } from "../github-workflows/index.js";

describe("migrateGithubWorkflows", () => {
    let testDir: string;

    beforeEach(async () => {
        testDir = join(tmpdir(), `gh-workflows-test-${randomUUID()}`);
        await mkdir(testDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(testDir, { recursive: true, force: true });
    });

    it("returns empty warnings when .github/workflows does not exist", async () => {
        const warnings = await migrateGithubWorkflows(AbsoluteFilePath.of(testDir));
        expect(warnings).toEqual([]);
    });

    it("returns empty warnings when workflows directory is empty", async () => {
        await mkdir(join(testDir, ".github", "workflows"), { recursive: true });
        const warnings = await migrateGithubWorkflows(AbsoluteFilePath.of(testDir));
        expect(warnings).toEqual([]);
    });

    it("rewrites 'fern generate' to 'fern sdk generate'", async () => {
        const workflowsDir = join(testDir, ".github", "workflows");
        await mkdir(workflowsDir, { recursive: true });
        const filePath = join(workflowsDir, "ci.yml");
        await writeFile(
            filePath,
            `name: CI
on: push
jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - run: fern generate
`
        );

        const warnings = await migrateGithubWorkflows(AbsoluteFilePath.of(testDir));
        expect(warnings.length).toBe(1);
        expect(warnings[0]?.message).toContain("ci.yml");

        const content = await readFile(filePath, "utf-8");
        expect(content).toContain("fern sdk generate");
        expect(content).not.toMatch(/fern generate(?! )/);
    });

    it("rewrites '--group' to '--target'", async () => {
        const workflowsDir = join(testDir, ".github", "workflows");
        await mkdir(workflowsDir, { recursive: true });
        const filePath = join(workflowsDir, "publish.yml");
        await writeFile(
            filePath,
            `name: Publish
on: push
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - run: fern generate --group my-sdk
`
        );

        await migrateGithubWorkflows(AbsoluteFilePath.of(testDir));

        const content = await readFile(filePath, "utf-8");
        expect(content).toContain("fern sdk generate --target my-sdk");
        expect(content).not.toContain("--group");
    });

    it("rewrites 'fern-api generate' variant", async () => {
        const workflowsDir = join(testDir, ".github", "workflows");
        await mkdir(workflowsDir, { recursive: true });
        const filePath = join(workflowsDir, "ci.yml");
        await writeFile(
            filePath,
            `steps:
  - run: fern-api generate --group staging
`
        );

        await migrateGithubWorkflows(AbsoluteFilePath.of(testDir));

        const content = await readFile(filePath, "utf-8");
        expect(content).toContain("fern-api sdk generate --target staging");
    });

    it("does not modify lines without fern generate", async () => {
        const workflowsDir = join(testDir, ".github", "workflows");
        await mkdir(workflowsDir, { recursive: true });
        const original = `name: CI
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test
      - run: fern check
`;
        const filePath = join(workflowsDir, "ci.yml");
        await writeFile(filePath, original);

        const warnings = await migrateGithubWorkflows(AbsoluteFilePath.of(testDir));
        expect(warnings).toEqual([]);

        const content = await readFile(filePath, "utf-8");
        expect(content).toBe(original);
    });

    it("handles multiple workflow files", async () => {
        const workflowsDir = join(testDir, ".github", "workflows");
        await mkdir(workflowsDir, { recursive: true });

        await writeFile(join(workflowsDir, "ci.yml"), "      - run: fern generate\n");
        await writeFile(join(workflowsDir, "publish.yaml"), "      - run: fern generate --group prod\n");

        const warnings = await migrateGithubWorkflows(AbsoluteFilePath.of(testDir));
        expect(warnings.length).toBe(2);

        const ci = await readFile(join(workflowsDir, "ci.yml"), "utf-8");
        expect(ci).toContain("fern sdk generate");

        const publish = await readFile(join(workflowsDir, "publish.yaml"), "utf-8");
        expect(publish).toContain("fern sdk generate --target prod");
    });

    it("ignores non-yaml files in workflows directory", async () => {
        const workflowsDir = join(testDir, ".github", "workflows");
        await mkdir(workflowsDir, { recursive: true });

        const original = "fern generate\n";
        await writeFile(join(workflowsDir, "notes.txt"), original);

        const warnings = await migrateGithubWorkflows(AbsoluteFilePath.of(testDir));
        expect(warnings).toEqual([]);

        const content = await readFile(join(workflowsDir, "notes.txt"), "utf-8");
        expect(content).toBe(original);
    });

    it("handles multiple fern commands on separate lines", async () => {
        const workflowsDir = join(testDir, ".github", "workflows");
        await mkdir(workflowsDir, { recursive: true });
        const filePath = join(workflowsDir, "multi.yml");
        await writeFile(
            filePath,
            `steps:
  - run: fern generate --group alpha
  - run: fern generate --group beta
`
        );

        await migrateGithubWorkflows(AbsoluteFilePath.of(testDir));

        const content = await readFile(filePath, "utf-8");
        expect(content).toContain("fern sdk generate --target alpha");
        expect(content).toContain("fern sdk generate --target beta");
    });
});
