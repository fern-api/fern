export {
    AbstractAPIWorkspace,
    type FernDefinition,
    FernWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation,
    type IdentifiableSource
} from "@fern-api/api-workspace-commons";
export { applyGeneratorSettingsToDefinitions } from "./applyGeneratorSettings";
export * from "./handleFailedWorkspaceParserResult";
export { loadAPIWorkspace } from "./loadAPIWorkspace";
export { loadDocsWorkspace } from "./loadDocsWorkspace";
export { getValidAbsolutePathToOpenAPI as loadOpenAPIFile } from "./loadOpenAPIFile";
export { type FernFile, type ParsedFernFile } from "./types/FernFile";
export { type DocsWorkspace, type Workspace } from "./types/Workspace";
