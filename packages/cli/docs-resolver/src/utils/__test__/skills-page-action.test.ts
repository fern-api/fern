import { docsYml } from "@fern-api/configuration";
import { describe, expect, it } from "vitest";

import { DocsDefinitionResolver } from "../../DocsDefinitionResolver.js";

function convertPageActionsFor(pageActions: docsYml.ParsedPageActionsConfig | undefined): unknown {
    const resolver = Object.create(DocsDefinitionResolver.prototype) as DocsDefinitionResolver;
    Reflect.set(resolver, "_parsedDocsConfig", { pageActions });
    Reflect.set(resolver, "collectedFileIds", new Map());

    const convertPageActions = Reflect.get(resolver, "convertPageActions") as () => unknown;
    return convertPageActions.call(resolver);
}

function makeParsedPageActions(
    skills: docsYml.ParsedPageActionsConfig["options"]["skills"]
): docsYml.ParsedPageActionsConfig {
    return {
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
            skills,
            skillsDirectory: undefined
        }
    };
}

describe("DocsDefinitionResolver page actions skills config", () => {
    it("emits the skills config on the register payload in the exact wire shape", () => {
        const config = convertPageActionsFor(
            makeParsedPageActions({
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
            })
        );

        expect(config).toEqual({
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
                skills: {
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
                }
            }
        });
    });

    it("emits an empty skills object as-is (action enabled with all defaults)", () => {
        const config = convertPageActionsFor(makeParsedPageActions({})) as {
            options: { skills: unknown };
        };
        expect(config.options.skills).toEqual({});
    });

    it("emits undefined skills when the action is not configured", () => {
        const config = convertPageActionsFor(makeParsedPageActions(undefined)) as {
            options: { skills: unknown };
        };
        expect(config.options.skills).toBeUndefined();
    });
});
