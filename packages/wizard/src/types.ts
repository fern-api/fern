export type ApiSpecFormat = "openapi" | "asyncapi" | "protobuf";

export interface ApiSpec {
    path: string;
    format: ApiSpecFormat;
    title?: string;
    version?: string;
}

export interface FernProject {
    exists: boolean;
    path?: string;
    docsConfigExists?: boolean;
}

export interface Framework {
    name: string;
    language: string;
    canGenerateOpenApi: boolean;
}

export type DocsTool = "mintlify" | "docusaurus" | "redocly" | "readme";
export type Agent = "cursor" | "claude-code" | "codex" | "vscode" | "windsurf";
export type PackageManager = "pnpm" | "yarn" | "bun" | "npm";

export interface DocsToolDetection {
    name: DocsTool;
    path: string;
}

export interface Detection {
    dir: string;
    fernProject: FernProject;
    apiSpecs: ApiSpec[];
    frameworks: Framework[];
    docsTools: DocsToolDetection[];
    agents: Agent[];
    packageManager: PackageManager;
    hasPackageJson: boolean;
    fernCliVersion: string | null;
}

export type RecommendationId =
    | "sdks"
    | "docs"
    | "docs-mcp"
    | "agent-mcp"
    | "spec-from-framework"
    | "docs-migration"
    | "cli";

export interface Recommendation {
    id: RecommendationId;
    title: string;
    why: string;
    link: string;
}

export type ActionId = "install-cli" | "init-api" | "init-docs" | "agent-mcp" | "agent-handoff" | "cli-interest";

export interface ActionPlan {
    id: ActionId;
    label: string;
    selectedByDefault: boolean;
}

export interface WizardFlags {
    dir: string;
    yes: boolean;
    dryRun: boolean;
    skipInstall: boolean;
    org?: string;
}
