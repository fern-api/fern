/**
 * `fern instructions` topics that CLI errors point coding agents to. Each one must exist on
 * https://buildwithfern.com/learn/home/fern-instructions.md; the `instructions` end-to-end test checks them all.
 */
export type InstructionsTopic = (typeof InstructionsTopic)[keyof typeof InstructionsTopic];
export const InstructionsTopic = {
    /** The topic list itself. Hints print it as bare `fern instructions`; `fern instructions index` also works. */
    Index: "index",
    NewSite: "new-site",
    SdksMigrate: "sdks migrate",
    AccessTeam: "access team"
} as const;
