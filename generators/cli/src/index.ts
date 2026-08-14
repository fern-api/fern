export { copySdk, SDK_TEMPLATE_DIRECTORY } from "./copySdk.js";
export {
    copySpecs,
    hasOpenApiSpecs,
    type RawSpecsManifest,
    type RawSpecsManifestEntry,
    readSpecsManifest,
    SPECS_DIRECTORY,
    SPECS_MANIFEST_FILENAME
} from "./copySpecs.js";
export {
    DEFAULT_HOMEBREW_TOKEN_ENV_VAR,
    DEFAULT_SCOOP_TOKEN_ENV_VAR,
    type FernCliCustomConfig,
    type FernCliDistributionConfig,
    type FernCliHomebrewConfig,
    type FernCliScoopConfig,
    getCustomConfig
} from "./customConfig.js";
export { type DetectedAuthBinding, detectAuthBindings } from "./detectAuth.js";
export { emitCiWorkflow, emitPublishWorkflow } from "./emitPublishWorkflow.js";
export { emitReadme } from "./emitReadme.js";
export { emitReference } from "./emitReference.js";
export { constructReleaseWorkflowYaml, emitReleaseWorkflow } from "./emitReleaseWorkflow.js";
export { constructScoopJobYaml, type ScoopJobArgs } from "./emitScoopWorkflow.js";
export { type EmbeddedSdkResult, generateEmbeddedSdk } from "./generateEmbeddedSdk.js";
export { generateSdk, type RootClientInfo, resolveClientTreeFromContext, type SubClientField } from "./generateSdk.js";
export { deriveBinaryName, TEMPLATE_BINARY_NAME, toEnvVarPrefix, toKebabCase } from "./identity.js";
export { type IrSummary, readIr } from "./ir.js";
export {
    applyCargoTomlPatch,
    applyPackageIdentityPatch,
    type CargoPackageIdentity,
    patchCargoLockVersion,
    patchCargoToml,
    renameCargoLockPackage,
    TEMPLATE_PACKAGE_NAME,
    withDistributionDefaults
} from "./patchCargoToml.js";
export {
    addToStringArray,
    addWorkspaceMember,
    applyDistWorkspacePatch,
    applyHomebrewPatch,
    applyRustlsPatch,
    patchDistWorkspaceToml,
    removeWorkspaceMember,
    setDistKey,
    setDistRawKey,
    stripNpmInstaller
} from "./patchDistWorkspace.js";
export {
    type ResolvedNpmPublishInfo,
    type ResolvedOutputConfig,
    resolveOutputConfig
} from "./resolveOutputConfig.js";
export { type PipelineOutcome, runPipeline } from "./runPipeline.js";
