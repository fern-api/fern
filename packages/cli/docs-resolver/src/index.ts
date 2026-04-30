import { type docsYml } from "@fern-api/configuration";

// Re-export markdown utilities needed for translation processing
export { replaceImagePathsAndUrls, stripMdxComments } from "@fern-api/docs-markdown-utils";
export { applyTranslatedFrontmatterToNavTree } from "./applyTranslatedFrontmatterToNavTree.js";
export {
    applyTranslatedNavigationOverlays,
    getTranslatedAnnouncement
} from "./applyTranslatedNavigationOverlays.js";
export type TranslationNavigationOverlay = docsYml.TranslationNavigationOverlay;
export { DocsDefinitionResolver, type UploadedFile } from "./DocsDefinitionResolver.js";
export { stitchGlobalTheme } from "./stitchGlobalTheme.js";
export { convertIrToApiDefinition } from "./utils/convertIrToApiDefinition.js";
export { filterOssWorkspaces } from "./utils/filterOssWorkspaces.js";
export { generateFdrFromOpenApiWorkspaceV3 } from "./utils/generateFdrFromOpenAPIWorkspaceV3.js";
export { wrapWithHttps } from "./wrapWithHttps.js";
