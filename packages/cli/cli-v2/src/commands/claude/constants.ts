/**
 * Constants describing the Fern Claude Code plugin.
 *
 * The actual plugin sources live at the repo root under `/.claude-plugin/` and
 * `/plugins/fern/`. The values below must stay in sync with those files.
 */
export const FERN_CLAUDE_PLUGIN = {
    /** GitHub `owner/repo` slug used by `/plugin marketplace add`. */
    marketplaceRepo: "fern-api/fern",
    /** `name` field in `.claude-plugin/marketplace.json`. */
    marketplaceName: "fern-api",
    /** `name` field in `plugins/fern/.claude-plugin/plugin.json`. */
    pluginName: "fern",
    /** Where the plugin manifest and skills live in this repo. */
    sourceUrl: "https://github.com/fern-api/fern/tree/main/plugins/fern",
    /** Docs URL for the Claude plugin system. */
    claudeDocsUrl: "https://docs.claude.com/en/docs/claude-code/plugins"
} as const;

export interface FernSkill {
    /** Skill identifier (folder name under plugins/fern/skills/). */
    name: string;
    /** Short description shown in `fern claude skills`. */
    description: string;
}

/**
 * The set of skills shipped by the Fern Claude Code plugin.
 *
 * Keep this in sync with the SKILL.md files under
 * `plugins/fern/skills/<name>/SKILL.md` at the repo root.
 */
export const FERN_SKILLS: readonly FernSkill[] = [
    {
        name: "init-fern-project",
        description: "Initialize a Fern project from an OpenAPI / AsyncAPI / gRPC definition."
    },
    {
        name: "generate-sdk",
        description: "Generate a language SDK (TypeScript, Python, Java, Go, Ruby, C#, PHP, Rust, Swift)."
    },
    {
        name: "scaffold-docs-site",
        description: "Scaffold a Fern documentation site from an existing API definition."
    },
    {
        name: "check-fern-config",
        description: "Validate a Fern project's configuration and API definition."
    },
    {
        name: "preview-docs",
        description: "Run a local Fern documentation preview server."
    }
] as const;

/**
 * The two slash commands a user runs inside Claude Code to install the
 * Fern plugin. Returned as an array so callers can join with newlines or
 * print one per line as needed.
 */
export function getInstallSlashCommands(): readonly string[] {
    return [
        `/plugin marketplace add ${FERN_CLAUDE_PLUGIN.marketplaceRepo}`,
        `/plugin install ${FERN_CLAUDE_PLUGIN.pluginName}@${FERN_CLAUDE_PLUGIN.marketplaceName}`
    ];
}
