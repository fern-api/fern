import type { TaskStageLabels } from "./TaskStageLabels.js";
import { TaskStatus } from "./TaskStatus.js";

/**
 * Defines a stage with labels for each possible status.
 * Used to configure stages upfront before execution.
 */
export interface TaskStageDefinition {
    /** Unique identifier for this stage (e.g., "configuration", "validation") */
    id: string;
    /** Labels to display for each status */
    labels: TaskStageLabels;
}

/**
 * Represents the runtime state of a stage within a task's execution.
 *
 * Stages provide structured progress tracking, showing users what work
 * is done vs. what remains.
 */
export interface TaskStage {
    /** Unique identifier for this stage */
    id: string;
    /** Current status of this stage */
    status: TaskStatus;
    /** Labels for each status */
    labels: TaskStageLabels;
    /** Optional extra info (e.g., image version) */
    detail?: string;
    /** Error message if status is "error" */
    error?: string;
}
