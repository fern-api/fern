import type { LayoutId } from "./docs-site/options";

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
    pnpmWorkspaceRoot: boolean;
    fernCliVersion: string | null;
    docsSkillInstalled: boolean;
}

/** What the user wants Fern to produce for this repository. */
export type Product = "sdks" | "docs";

export type StepId = "cli-setup" | "agent" | "skills" | "publish" | "generate";

export type ActionId =
    | "install-cli"
    | "init-api"
    | "init-docs"
    | "docs-skills"
    | "agent-mcp"
    | "agent-handoff"
    | "publish-docs"
    | "generate-sdks";

/** Docs URLs produced while running the wizard. */
/** What the wizard produced, for the closing summary. */
export interface PublishResult {
    previewUrl?: string;
    publishedUrl?: string;
    /** SDKs written to this repository, with their output directories. */
    generatedSdks?: Array<{ label: string; path: string }>;
}

export interface ActionPlan {
    id: ActionId;
    title: string;
    /** Plain-language explanation of what the step does. */
    description: string;
    /** Exact commands the step runs. */
    commands: string[];
    /** Files the step writes directly, relative to the repository. */
    files: string[];
    selectedByDefault: boolean;
}

export interface SetupStep {
    id: StepId;
    title: string;
    /** Yes/no question asked before the step runs. */
    question: string;
    actions: ActionPlan[];
}

export interface ActionPlanResult {
    actions: ActionPlan[];
    notes: string[];
}

export type SplashStyle = "orb" | "burst" | "filings" | "brooklyn";

export interface WizardFlags {
    dir: string;
    yes: boolean;
    dryRun: boolean;
    skipInstall: boolean;
    org?: string;
    template?: LayoutId;
    splash?: SplashStyle;
    /** Company name or domain to pull docs branding from, instead of guessing. */
    brand?: string;
    /** Skip the brand lookup and keep the starter branding. */
    skipBrand?: boolean;
    /** What to set up, instead of asking (or the detected default with --yes). */
    products?: Product[];
    /** The API spec to import, relative to the repository, instead of asking. */
    spec?: string;
    /** Don't connect Fern's MCP server to the coding agents. */
    skipMcp?: boolean;
}
