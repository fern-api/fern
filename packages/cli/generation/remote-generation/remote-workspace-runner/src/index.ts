export { findGeneratorLineNumber, GeneratorOccurrenceTracker, getOutputRepoUrl } from "./automationMetadata.js";
export { getDynamicGeneratorConfig } from "./getDynamicGeneratorConfig.js";
export type { PublishTarget } from "./publishTarget.js";
export { extractPublishTarget } from "./publishTarget.js";
export type {
    AutomationRunOptions,
    GeneratorSkipReason,
    RemoteGeneratorRunRecorder
} from "./RemoteGeneratorRunRecorder.js";
export { runRemoteGenerationForAPIWorkspace } from "./runRemoteGenerationForAPIWorkspace.js";
export { runRemoteGenerationForDocsWorkspace } from "./runRemoteGenerationForDocsWorkspace.js";
