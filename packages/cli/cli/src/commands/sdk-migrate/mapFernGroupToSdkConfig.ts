// The mapper lives in remote-workspace-runner so `fern generate` can build SDK Config v1
// payloads for sdk-gen-api without depending on the CLI package; re-exported here for
// `fern sdk migrate` and its tests.
export {
    formatSdkConfigMappingDiagnostic,
    type MappingResult,
    mapFernDefinitionToSdkConfigApi,
    mapFernGroupToSdkConfig,
    type SourceDerivedApiFields
} from "@fern-api/remote-workspace-runner";
