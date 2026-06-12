import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DocsDefinitionResolver, FilePathPair } from "../../DocsDefinitionResolver.js";

describe("DocsDefinitionResolver collectAgentSkillsUploads", () => {
    let fernFolder: AbsoluteFilePath;
    let skillsFolder: AbsoluteFilePath;
    let warn: ReturnType<typeof vi.fn>;

    beforeEach(async () => {
        fernFolder = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-folder-")));
        skillsFolder = AbsoluteFilePath.of(await mkdtemp(path.join(tmpdir(), "fern-skills-")));
        warn = vi.fn();
    });

    afterEach(async () => {
        await rm(fernFolder, { recursive: true, force: true });
        await rm(skillsFolder, { recursive: true, force: true });
    });

    async function writeFileAt(root: AbsoluteFilePath, relativePath: string, contents = "contents"): Promise<void> {
        const absolutePath = path.join(root, relativePath);
        await mkdir(path.dirname(absolutePath), { recursive: true });
        await writeFile(absolutePath, contents);
    }

    function collectUploadsFor(skillsDirectory: AbsoluteFilePath | undefined): Promise<FilePathPair[]> {
        const pageActions: docsYml.ParsedPageActionsConfig = {
            default: undefined,
            options: {
                askAi: true,
                copyPage: true,
                viewAsMarkdown: true,
                openAi: true,
                claude: true,
                cursor: true,
                claudeCode: true,
                vscode: false,
                custom: [],
                skills: {},
                skillsDirectory
            }
        };

        const resolver = Object.create(DocsDefinitionResolver.prototype) as DocsDefinitionResolver;
        Reflect.set(resolver, "_parsedDocsConfig", { pageActions });
        Reflect.set(resolver, "docsWorkspace", { absoluteFilePath: fernFolder });
        Reflect.set(resolver, "taskContext", { logger: { warn, debug: vi.fn() } });

        const collectAgentSkillsUploads = Reflect.get(resolver, "collectAgentSkillsUploads") as () => Promise<
            FilePathPair[]
        >;
        return collectAgentSkillsUploads.call(resolver);
    }

    function skillMarkdown(name: string): string {
        return `---\nname: ${name}\ndescription: Does ${name} things.\n---\n`;
    }

    it("re-homes declared skills at .well-known/skills/<name>/… and generates index.json", async () => {
        await writeFileAt(skillsFolder, "best-practices/SKILL.md", skillMarkdown("best-practices"));
        await writeFileAt(skillsFolder, "best-practices/references/api.md", "# API\n");
        await writeFileAt(skillsFolder, "upgrade-guide/SKILL.md", skillMarkdown("upgrade-guide"));

        const uploads = await collectUploadsFor(skillsFolder);

        expect(uploads.map((upload) => String(upload.relativeFilePath))).toEqual([
            ".well-known/skills/index.json",
            ".well-known/skills/best-practices/SKILL.md",
            ".well-known/skills/best-practices/references/api.md",
            ".well-known/skills/upgrade-guide/SKILL.md"
        ]);

        // the generated manifest lives in a temp directory — nothing is written back to the repo
        const indexJson = uploads[0];
        expect(indexJson?.absoluteFilePath.startsWith(fernFolder)).toBe(false);
        expect(indexJson?.absoluteFilePath.startsWith(skillsFolder)).toBe(false);
        expect(JSON.parse(await readFile(indexJson?.absoluteFilePath ?? "", "utf-8"))).toEqual({
            skills: [
                {
                    name: "best-practices",
                    description: "Does best-practices things.",
                    files: ["SKILL.md", "references/api.md"]
                },
                { name: "upgrade-guide", description: "Does upgrade-guide things.", files: ["SKILL.md"] }
            ]
        });

        // skill files upload from their original location in the repo
        expect(uploads[1]?.absoluteFilePath).toEqual(path.join(skillsFolder, "best-practices/SKILL.md"));
    });

    it("warns and skips a hand-populated .well-known/skills folder when a path is declared", async () => {
        await writeFileAt(skillsFolder, "my-skill/SKILL.md", skillMarkdown("my-skill"));
        await writeFileAt(fernFolder, ".well-known/skills/index.json", JSON.stringify({ skills: [] }));
        await writeFileAt(fernFolder, ".well-known/skills/old-skill/SKILL.md", skillMarkdown("old-skill"));
        await writeFileAt(fernFolder, ".well-known/agent-skills/index.json", JSON.stringify({ skills: [] }));

        const uploads = await collectUploadsFor(skillsFolder);

        expect(warn).toHaveBeenCalledWith(expect.stringContaining("Ignoring .well-known/skills/"));
        expect(uploads.map((upload) => String(upload.relativeFilePath))).toEqual([
            ".well-known/skills/index.json",
            ".well-known/skills/my-skill/SKILL.md",
            // the agent-skills passthrough never conflicts with the generated bundle
            ".well-known/agent-skills/index.json"
        ]);
        // the served index.json is the generated manifest, not the hand-populated one
        expect(uploads[0]?.absoluteFilePath.startsWith(fernFolder)).toBe(false);
    });

    it("fails the publish when the declared skills are invalid", async () => {
        await writeFileAt(skillsFolder, "my-skill/SKILL.md", skillMarkdown("other-name"));

        await expect(collectUploadsFor(skillsFolder)).rejects.toThrow(
            /Invalid agent skills under .*must match its parent directory/s
        );
    });

    it("uploads raw .well-known folders verbatim when no path is declared (legacy passthrough)", async () => {
        await writeFileAt(fernFolder, ".well-known/skills/index.json", JSON.stringify({ skills: [] }));
        await writeFileAt(fernFolder, ".well-known/skills/my-skill/SKILL.md", skillMarkdown("my-skill"));
        await writeFileAt(fernFolder, ".well-known/agent-skills/index.json", JSON.stringify({ skills: [] }));

        const uploads = await collectUploadsFor(undefined);

        expect(uploads.map((upload) => String(upload.relativeFilePath)).sort()).toEqual([
            ".well-known/agent-skills/index.json",
            ".well-known/skills/index.json",
            ".well-known/skills/my-skill/SKILL.md"
        ]);
        expect(warn).not.toHaveBeenCalled();
    });
});
