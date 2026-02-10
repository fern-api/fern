/**
 * The labels associated with a particular task stage.
 *
 * @example
 * {
 *     pending: "Load configuration",
 *     running: "Loading configuration...",
 *     success: "Loaded configuration",
 *     error: "Failed to load configuration"
 * }
 */
export interface TaskStageLabels {
    pending: string;
    running: string;
    success: string;
    error?: string;
    skipped?: string;
}
