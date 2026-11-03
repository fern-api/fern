export type DocsSkillTarget = "claude-code" | "cursor" | "codex" | "github-copilot" | "windsurf";

export const DOCS_SKILL_PATHS: Record<DocsSkillTarget, string> = {
    "claude-code": ".claude/skills/fern-docs/",
    cursor: ".agents/skills/fern-docs/",
    codex: ".agents/skills/fern-docs/",
    "github-copilot": ".agents/skills/fern-docs/",
    windsurf: ".windsurf/skills/fern-docs/"
};
