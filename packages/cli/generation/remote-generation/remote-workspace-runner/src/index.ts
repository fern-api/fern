export { findGeneratorLineNumber, GeneratorOccurrenceTracker, getOutputRepoUrl } from "./automationMetadata.js";
export { getFernSdkGenApiLanguage, isFernSdkGenApiEnabled } from "./fernSdkGenApi.js";
export type {
    FernSdkGenApiImportSettings,
    FernSdkGenApiSourceArchive,
    FernSdkGenApiSourceManifest,
    FernSdkGenApiSourceManifestEntry,
    FernSdkGenApiSourceType
} from "./fernSdkGenApiSourceArchive.js";
export { getDynamicGeneratorConfig } from "./getDynamicGeneratorConfig.js";
export { getGeneratorConfig, getGithubPublishConfig, getLicensePathFromConfig } from "./getGeneratorConfig.js";
export type { PublishTarget } from "./publishTarget.js";
export { extractPublishTarget } from "./publishTarget.js";
export type {
    AutomationRunOptions,
    GeneratorSkipReason,
    RemoteGeneratorRunRecorder
} from "./RemoteGeneratorRunRecorder.js";
export type { FernSourceArchiveRequest, FernSourceArchiveResolution } from "./runRemoteGenerationForAPIWorkspace.js";
export { runRemoteGenerationForAPIWorkspace } from "./runRemoteGenerationForAPIWorkspace.js";
export { runRemoteGenerationForDocsWorkspace } from "./runRemoteGenerationForDocsWorkspace.js";
