export { findGeneratorLineNumber, GeneratorOccurrenceTracker, getOutputRepoUrl } from "./automationMetadata.js";
export type { FernSdkGenApiPublishCredentialSource } from "./directPublishCredentials.js";
export {
    discoverLatestSdkGenApiGeneratorVersions,
    discoverSdkGenApiGeneratorVersions,
    type SdkGenApiGeneratorVersions
} from "./discoverSdkGenApiGeneratorVersions.js";
export {
    isDynamicIrWorkerThread,
    registerDynamicIrWorkerEntrypoint,
    runDynamicIrWorkerThread
} from "./dynamicIr/DynamicIrWorkerPool.js";
export type {
    FernSdkConfigV1Payload,
    FernSdkGenApiPackageConfig,
    FernSdkGenApiRequestedOutput
} from "./fernSdkGenApi.js";
export {
    createFernSdkGenApiRequest,
    getFernSdkGenApiLanguage,
    getFernSdkGenApiOrigin,
    isFernSdkGenApiEnabled,
    isSdkGenApiOnly,
    synthesizesSdkConfig,
    validateFernSdkGenApiPublishCredentialSource,
    validateFernSdkGenApiPublishCredentialSources,
    validateFernSdkGenApiPublishTargets
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
export { measureImageSizes } from "./measureImageSizes.js";
export { normalizeRepoUrlToHttps } from "./normalizeRepoUrl.js";
export {
    formatSdkConfigMappingDiagnostic,
    type MapFernGroupToSdkConfig,
    prepareFernSdkGenApiSdkConfigPayload,
    type SdkConfigMappingResult
} from "./prepareFernSdkGenApiSdkConfigPayload.js";
export { sanitizeRelativePathForS3 } from "./publishDocs.js";
export type { BuiltTranslation } from "./publishDocsLedger.js";
export { buildAllTranslationInputs, buildLedgerInput } from "./publishDocsLedger.js";
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
export { selectGeneratorConfigRoute } from "./sdk-gen-client/index.js";
export {
    FERN_GENERATOR_LATEST_VERSION,
    isGeneratorVersionForUnpinnedRoute,
    isSdkConfigUnpinnedGeneratorVersion,
    resolveSdkConfigGeneratorVersion,
    SDK_CONFIG_UNPINNED_GENERATOR_VERSION
} from "./sdkConfigGeneratorVersion.js";
