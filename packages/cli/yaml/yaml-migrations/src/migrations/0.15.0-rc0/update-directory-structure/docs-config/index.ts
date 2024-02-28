export { FernDocsConfig as MigratedDocs, type DocsInstances as DocsURL } from "@fern-api/docs-config-sdk";
export { FernDocsConfig as LegacyDocs } from "@fern-fern/legacy-docs-config";
export * as LegacyDocsSerializers from "@fern-fern/legacy-docs-config/serialization";
export {
    getAbsolutePathToDocsFolder,
    getAbsolutePathToDocsYaml,
    loadRawDocsConfiguration
} from "./loadRawDocsConfiguration";
