export { FernDocsConfig as MigratedDocs } from "@fern-fern/docs-config";
export { type DocsInstances as DocsURL } from "@fern-fern/docs-config/api";
export { FernDocsConfig as LegacyDocs } from "@fern-fern/legacy-docs-config";
export * as LegacyDocsSerializers from "@fern-fern/legacy-docs-config/serialization";
export {
    getAbsolutePathToDocsFolder,
    getAbsolutePathToDocsYaml,
    loadRawDocsConfiguration
} from "./loadRawDocsConfiguration";
