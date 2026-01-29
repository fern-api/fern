import { GitOutputMode } from "./GitOutputMode";
import { License } from "./License";

export interface GitOutputConfig {
    /** Git repository URL or identifier */
    repository: string;

    /** Publishing mode (default: "pr") */
    mode: GitOutputMode;

    /** Branch to push to (only used with mode: "push") */
    branch?: string;

    /** License to include in the repository */
    license?: License;
}
