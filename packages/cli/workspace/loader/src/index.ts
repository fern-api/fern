export {
    AbstractAPIWorkspace,
    type FernDefinition,
    FernWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation,
    type IdentifiableSource
} from "@fern-api/api-workspace-commons";
export * from "./handleFailedWorkspaceParserResult.js";
export { loadAPIWorkspace } from "./loadAPIWorkspace.js";
export { loadDocsWorkspace } from "./loadDocsWorkspace.js";
export { getValidAbsolutePathToOpenAPI as loadOpenAPIFile } from "./loadOpenAPIFile.js";
export { type FernFile, type ParsedFernFile } from "./types/FernFile.js";
export { type DocsWorkspace, type Workspace } from "./types/Workspace.js";
