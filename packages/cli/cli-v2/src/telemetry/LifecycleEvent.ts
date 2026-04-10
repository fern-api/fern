import type { CliError } from "../errors/CliError.js";

export interface LifecycleEvent {
    /** The command that was run */
    command: string;
    /** The status of the command */
    status: "success" | "error";
    /** The duration of the command in milliseconds */
    durationMs: number;
    /** The error code of the command, if it failed */
    errorCode?: CliError.Code;
}
