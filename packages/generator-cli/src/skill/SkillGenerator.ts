import type fs from "fs";

import { FernGeneratorCli } from "../configuration/sdk/index.js";
import {
    assertNever,
    featureIDToTitle,
    getPackageName,
    languageToTitle,
    pascalCase,
    writeInstallation
} from "../readme/shared.js";
import { StreamWriter, StringWriter, type Writer } from "../utils/Writer.js";

export const SKILLS_DIRECTORY = ".agents/skills";
export const SKILL_FILENAME = "SKILL.md";

const MAX_SKILL_NAME_LENGTH = 64;
const SKIPPED_FEATURE_IDS = new Set<string>([FernGeneratorCli.StructuredFeatureId.Contributing]);

/**
 * Returns the agent-skill name for an SDK, e.g. `acme-typescript-sdk`.
 * Skill names must be lowercase alphanumerics and hyphens, at most 64 characters.
 */
export function getSkillName(readmeConfig: FernGeneratorCli.ReadmeConfig): string {
    const base = toKebabCase(readmeConfig.apiName ?? readmeConfig.organization);
    const suffix = `-${readmeConfig.language.type}-sdk`;
    const name = `${base.slice(0, MAX_SKILL_NAME_LENGTH - suffix.length)}${suffix}`;
    return name.replace(/-+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Returns the directory, relative to the SDK root, where the SKILL.md for this SDK lives.
 */
export function getSkillDirectory(readmeConfig: FernGeneratorCli.ReadmeConfig): string {
    return `${SKILLS_DIRECTORY}/${getSkillName(readmeConfig)}`;
}

/**
 * Renders a SKILL.md (https://agentskills.io) that teaches a coding agent how to use the generated SDK.
 * It is built from the same ReadmeConfig that drives README.md generation, so every snippet is real
 * generated code for this API.
 */
export class SkillGenerator {
    private readmeConfig: FernGeneratorCli.ReadmeConfig;
    private languageTitle: string;
    private apiName: string;
    private packageName: string | undefined;

    constructor({ readmeConfig }: { readmeConfig: FernGeneratorCli.ReadmeConfig }) {
        this.readmeConfig = readmeConfig;
        this.languageTitle = languageToTitle(readmeConfig.language);
        this.apiName = readmeConfig.apiName ?? pascalCase(readmeConfig.organization);
        this.packageName = getPackageName(readmeConfig.language);
    }

    public async generateSkill({ output }: { output: fs.WriteStream | NodeJS.Process["stdout"] }): Promise<void> {
        const writer = new StreamWriter(output);
        await this.writeSkill({ writer });
        await writer.end();
    }

    public async generateSkillToString(): Promise<string> {
        const writer = new StringWriter();
        await this.writeSkill({ writer });
        await writer.end();
        return writer.toString();
    }

    private async writeSkill({ writer }: { writer: Writer }): Promise<void> {
        await this.writeFrontmatter({ writer });
        await writer.writeLine(`# ${this.apiName} ${this.languageTitle} SDK`);
        await writer.writeLine();
        if (this.readmeConfig.introduction != null) {
            await writer.writeLine(this.readmeConfig.introduction);
            await writer.writeLine();
        }
        await this.writeWhenToUse({ writer });
        await this.writeInstallation({ writer });
        await this.writeFeatures({ writer });
        await this.writeResources({ writer });
        await this.writeRules({ writer });
    }

    private async writeFrontmatter({ writer }: { writer: Writer }): Promise<void> {
        const packageDescription = this.packageName != null ? ` (\`${this.packageName}\`)` : "";
        const topics = this.getFeatures()
            .map((feature) => featureIDToTitle(feature.id).toLowerCase())
            .join(", ");
        await writer.writeLine("---");
        await writer.writeLine(`name: ${getSkillName(this.readmeConfig)}`);
        await writer.writeLine("description: >-");
        await writer.writeLine(
            `  Use the ${this.apiName} ${this.languageTitle} SDK${packageDescription} to call the ${this.apiName} API:`
        );
        await writer.writeLine(`  installation${topics.length > 0 ? `, ${topics}` : ""}.`);
        await writer.writeLine(
            `  Use when writing ${this.languageTitle} code that talks to ${this.apiName}, or when a user asks how to`
        );
        await writer.writeLine(`  do something with the ${this.apiName} ${this.languageTitle} SDK.`);
        await writer.writeLine("---");
        await writer.writeLine();
    }

    private async writeWhenToUse({ writer }: { writer: Writer }): Promise<void> {
        await writer.writeLine("## When to use this skill");
        await writer.writeLine();
        await writer.writeLine(
            `Use this skill whenever the task involves calling the ${this.apiName} API from ${this.languageTitle}. ` +
                `Prefer the SDK over hand-written HTTP requests: it handles authentication, serialization, ` +
                `errors, retries and timeouts for you.`
        );
        await writer.writeLine();
    }

    private async writeInstallation({ writer }: { writer: Writer }): Promise<void> {
        if (this.readmeConfig.language.publishInfo == null) {
            return;
        }
        await writer.writeLine("## Installation");
        await writer.writeLine();
        if (this.readmeConfig.requirements != null && this.readmeConfig.requirements.length > 0) {
            await writer.writeLine(`Requires ${this.readmeConfig.requirements.join(", ")}.`);
            await writer.writeLine();
        }
        await writeInstallation({ writer, language: this.readmeConfig.language });
    }

    private async writeFeatures({ writer }: { writer: Writer }): Promise<void> {
        for (const feature of this.getFeatures()) {
            await writer.writeLine(`## ${featureIDToTitle(feature.id)}`);
            await writer.writeLine();
            if (feature.description != null) {
                await writer.writeLine(feature.description);
            }
            for (const [index, snippet] of feature.snippets?.entries() ?? []) {
                if (index > 0) {
                    await writer.writeLine();
                }
                await this.writeSnippet({ writer, snippet });
            }
            if (feature.addendum != null) {
                await writer.writeLine(feature.addendum);
            }
            await writer.writeLine();
        }
    }

    private async writeSnippet({
        writer,
        snippet
    }: {
        writer: Writer;
        snippet: FernGeneratorCli.Snippet;
    }): Promise<void> {
        if (typeof snippet === "string") {
            await writer.writeCodeBlock(this.readmeConfig.language.type, snippet);
            return;
        }
        switch (snippet.type) {
            case "markdown":
                await writer.writeLine(snippet.content);
                break;
            case "code":
                await writer.writeCodeBlock(snippet.language ?? this.readmeConfig.language.type, snippet.content);
                break;
            default:
                assertNever(snippet);
        }
    }

    private async writeResources({ writer }: { writer: Writer }): Promise<void> {
        const resources: string[] = [];
        if (this.readmeConfig.referenceMarkdownPath != null) {
            const referenceLink =
                this.readmeConfig.remote?.repoUrl != null
                    ? `${this.readmeConfig.remote.repoUrl}/blob/HEAD/${this.readmeConfig.referenceMarkdownPath}`
                    : this.readmeConfig.referenceMarkdownPath;
            resources.push(
                `Full list of clients, methods, parameters and return types for this SDK: [${this.readmeConfig.referenceMarkdownPath}](${referenceLink}). Read it before guessing a method name.`
            );
        }
        if (this.readmeConfig.apiReferenceLink != null) {
            resources.push(`API reference documentation: ${this.readmeConfig.apiReferenceLink}`);
        }
        if (this.readmeConfig.remote?.repoUrl != null) {
            resources.push(`SDK source and README: ${this.readmeConfig.remote.repoUrl}`);
        }
        if (resources.length === 0) {
            return;
        }
        await writer.writeLine("## Resources");
        await writer.writeLine();
        for (const resource of resources) {
            await writer.writeLine(`- ${resource}`);
        }
        await writer.writeLine();
    }

    private async writeRules({ writer }: { writer: Writer }): Promise<void> {
        await writer.writeLine("## Rules");
        await writer.writeLine();
        await writer.writeLine(
            "- Read credentials from environment variables or a secrets manager; never hard-code API keys or tokens in source code."
        );
        await writer.writeLine(
            "- Use the typed request and response objects exported by the SDK instead of building raw JSON."
        );
        await writer.writeLine(
            "- Catch the SDK's typed errors and inspect the status code and body instead of matching on error messages."
        );
        await writer.writeLine(
            "- Do not edit generated SDK files; configure behavior through client options (base URL, headers, timeouts, retries)."
        );
        await writer.writeLine(
            "- If a method or type is missing from this skill, look it up in the reference before falling back to raw HTTP."
        );
    }

    private getFeatures(): FernGeneratorCli.ReadmeFeature[] {
        return (this.readmeConfig.features ?? []).filter((feature) => !this.shouldSkipFeature(feature));
    }

    private shouldSkipFeature(feature: FernGeneratorCli.ReadmeFeature): boolean {
        if (SKIPPED_FEATURE_IDS.has(feature.id.toUpperCase())) {
            return true;
        }
        if (this.readmeConfig.disabledFeatures?.some((id) => id.toUpperCase() === feature.id.toUpperCase())) {
            return true;
        }
        return !feature.snippetsAreOptional && (feature.snippets == null || feature.snippets.length === 0);
    }
}

function toKebabCase(s: string): string {
    return s
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
