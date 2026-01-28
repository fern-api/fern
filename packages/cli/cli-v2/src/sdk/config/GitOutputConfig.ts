/**
 * GitHub publishing mode.
 *  - `pr`: Opens a PR with the generated code (default).
 *  - `release`: Commits directly and creates a GitHub release.
 *  - `push`: Commits directly to the specified branch.
 */
export type GitMode = "pr" | "release" | "push";

export interface GitOutputConfig {
    /** Git repository URL or identifier */
    repository: string;

    /** Publishing mode (default: "pr") */
    mode: GitMode;

    /** Branch to push to (only used with mode: "push") */
    branch?: string;
}
