import type { TaskLog } from "./TaskLog.js";
import type { TaskStage } from "./TaskStage.js";
import type { TaskStatus } from "./TaskStatus.js";

export interface Task {
    /** Unique identifier for the task */
    id: string;
    /** Display name for the task */
    name: string;
    /** The current status of the task */
    status: TaskStatus;
    /** The current step description (shown while running) */
    currentStep?: string;
    /** The output paths and/or URLs (shown if status is success) */
    output?: string[];
    /** The error message (shown if status is error) */
    error?: string;
    /** The reason the task was skipped (shown if status is skipped) */
    skipReason?: string;
    /** The start time of the task */
    startTime?: number;
    /** The end time of the task */
    endTime?: number;
    /** Logs collected during task execution */
    logs?: TaskLog[];
    /** Structured stages for progress tracking */
    stages?: TaskStage[];
}
