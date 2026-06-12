import { docsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { describe, expect, it } from "vitest";

import { parseDocsConfiguration } from "../parseDocsConfiguration.js";

const FAKE_FERN_DIR = "/fern" as AbsoluteFilePath;
const FAKE_CONFIG_PATH = "/fern/docs.yml" as AbsoluteFilePath;

async function parseRawDocsYml(rawDocsYml: unknown): Promise<docsYml.ParsedDocsConfiguration> {
    // mirrors loadDocsWorkspace: kebab-case docs.yml keys -> camelCase raw config
    const rawDocsConfiguration = docsYml.RawSchemas.Serializer.DocsConfiguration.parseOrThrow(rawDocsYml);
    return await parseDocsConfiguration({
        rawDocsConfiguration,
        absolutePathToFernFolder: FAKE_FERN_DIR,
        absoluteFilepathToDocsConfig: FAKE_CONFIG_PATH,
        context: createMockTaskContext()
    });
}

describe("parseDocsConfiguration — page-actions.options.skills", () => {
    it("is undefined (action hidden) when the skills key is omitted", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "page-actions": { options: { "copy-page": true } }
        });
        expect(parsed.pageActions?.options.skills).toBeUndefined();
    });

    it("maps a full config 1:1 from kebab-case to the camelCase wire shape", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "page-actions": {
                options: {
                    skills: {
                        title: "Install agent skills",
                        description: "Skills for authoring Fern docs, maintained in our skills repo.",
                        "learn-more-url": "https://buildwithfern.com/learn/docs/ai/agent-skills",
                        "install-command": "npx skills add fern-api/skills --skill fern-docs",
                        skills: [
                            {
                                name: "fern-docs",
                                description: "Author and edit Fern documentation",
                                url: "https://github.com/fern-api/skills/tree/main/skills/fern-docs"
                            }
                        ]
                    }
                }
            }
        });

        expect(parsed.pageActions?.options.skills).toEqual({
            title: "Install agent skills",
            description: "Skills for authoring Fern docs, maintained in our skills repo.",
            learnMoreUrl: "https://buildwithfern.com/learn/docs/ai/agent-skills",
            installCommand: "npx skills add fern-api/skills --skill fern-docs",
            skills: [
                {
                    name: "fern-docs",
                    description: "Author and edit Fern documentation",
                    url: "https://github.com/fern-api/skills/tree/main/skills/fern-docs"
                }
            ]
        });
    });

    it("treats an empty object as valid and enables the action with all defaults", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "page-actions": { options: { skills: {} } }
        });

        const skills = parsed.pageActions?.options.skills;
        expect(skills).toBeDefined();
        expect(skills?.title).toBeUndefined();
        expect(skills?.installCommand).toBeUndefined();
        expect(skills?.skills).toBeUndefined();
    });

    it("preserves a list-form install-command (multi-step installs)", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "page-actions": {
                options: {
                    skills: {
                        "install-command": [
                            "git clone https://github.com/fern-api/skills",
                            "cp -r skills ~/.claude/skills"
                        ]
                    }
                }
            }
        });

        expect(parsed.pageActions?.options.skills?.installCommand).toEqual([
            "git clone https://github.com/fern-api/skills",
            "cp -r skills ~/.claude/skills"
        ]);
    });

    it("resolves `path` against the docs.yml directory and keeps it off the FDR-bound config", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "page-actions": { options: { skills: { path: "./agent-skills" } } }
        });

        expect(parsed.pageActions?.options.skillsDirectory).toEqual("/fern/agent-skills");
        // `path` is CLI-only: the docs site reads the served manifest, not the repo path
        expect(parsed.pageActions?.options.skills).toEqual({});
    });

    it("resolves a `../` path (e.g. a repo-root .agents/skills folder shared with coding agents)", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "page-actions": { options: { skills: { path: "../.agents/skills" } } }
        });

        expect(parsed.pageActions?.options.skillsDirectory).toEqual("/.agents/skills");
    });

    it("leaves skillsDirectory undefined when no path is declared", async () => {
        const parsed = await parseRawDocsYml({
            instances: [],
            navigation: [],
            "page-actions": { options: { skills: {} } }
        });

        expect(parsed.pageActions?.options.skillsDirectory).toBeUndefined();
    });

    it("rejects a skill entry without a name", async () => {
        await expect(
            parseRawDocsYml({
                instances: [],
                navigation: [],
                "page-actions": {
                    options: {
                        skills: {
                            skills: [{ description: "missing name" }]
                        }
                    }
                }
            })
        ).rejects.toThrow();
    });
});
