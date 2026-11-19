/**
 * `fern instructions` topics that CLI errors point coding agents to. Each one must exist on
 * https://buildwithfern.com/learn/home/fern-instructions.md; the `instructions` end-to-end test checks them all.
 */
export type InstructionsTopic = (typeof InstructionsTopic)[keyof typeof InstructionsTopic];
export const InstructionsTopic = {
    /** The topic list itself. Hints print it as bare `fern instructions`; `fern instructions index` also works. */
    Index: "index",
    NewSite: "new-site",
    Troubleshoot: "troubleshoot",
    DocsWrite: "docs write",
    DocsConfigure: "docs configure",
    DocsConfigureNavigation: "docs configure navigation",
    DocsConfigureSeo: "docs configure seo",
    DocsConfigureLocalization: "docs configure localization",
    DocsApiReference: "docs api-reference",
    DocsPublishDomain: "docs publish domain",
    DocsAccess: "docs access",
    DocsAi: "docs ai",
    Spec: "spec",
    SpecOverrides: "spec overrides",
    Sdks: "sdks",
    SdksPublish: "sdks publish",
    SdksMigrate: "sdks migrate",
    AccessTeam: "access team"
} as const;
