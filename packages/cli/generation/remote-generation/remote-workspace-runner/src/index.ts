export { findGeneratorLineNumber, GeneratorOccurrenceTracker, getOutputRepoUrl } from "./automationMetadata.js";
export type {
    FernSdkConfigV1Payload,
    FernSdkGenApiPackageConfig,
    FernSdkGenApiRequestedOutput
} from "./fernSdkGenApi.js";
export {
    createFernSdkGenApiRequest,
    getFernSdkGenApiLanguage,
    isFernSdkGenApiEnabled,
    isSdkGenApiOnly,
    synthesizesSdkConfig
} from "./fernSdkGenApi.js";
export type {
    FernSdkGenApiImportSettings,
    FernSdkGenApiSourceArchive,
    FernSdkGenApiSourceManifest,
    FernSdkGenApiSourceManifestEntry,
    FernSdkGenApiSourceType
} from "./fernSdkGenApiSourceArchive.js";
export { getDynamicGeneratorConfig } from "./getDynamicGeneratorConfig.js";
export { getGeneratorConfig, getGithubPublishConfig, getLicensePathFromConfig } from "./getGeneratorConfig.js";
export { normalizeRepoUrlToHttps } from "./normalizeRepoUrl.js";
export {
    formatSdkConfigMappingDiagnostic,
    type MapFernGroupToSdkConfig,
    prepareFernSdkGenApiSdkConfigPayload,
    type SdkConfigMappingResult
} from "./prepareFernSdkGenApiSdkConfigPayload.js";
export type { PublishTarget } from "./publishTarget.js";
export { extractPublishTarget } from "./publishTarget.js";
export type {
    AutomationRunOptions,
    GeneratorSkipReason,
    RemoteGeneratorRunRecorder
} from "./RemoteGeneratorRunRecorder.js";
export type { FernSourceArchiveRequest, FernSourceArchiveResolution } from "./runRemoteGenerationForAPIWorkspace.js";
export {
    prepareFernSdkGenApiRoutes,
    runRemoteGenerationForAPIWorkspace
} from "./runRemoteGenerationForAPIWorkspace.js";
export { runRemoteGenerationForDocsWorkspace } from "./runRemoteGenerationForDocsWorkspace.js";
export {
    isSdkConfigUnpinnedGeneratorVersion,
    resolveSdkConfigGeneratorVersion,
    SDK_CONFIG_UNPINNED_GENERATOR_VERSION
} from "./sdkConfigGeneratorVersion.js";
