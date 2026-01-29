import { GitOutputConfig } from "./GitOutputConfig";

export interface OutputConfig {
    /** Local filesystem path for output */
    path?: string;
    /** Git repository configuration */
    git?: GitOutputConfig;
}
