// Re-export markdown utilities needed for translation processing
export { replaceImagePathsAndUrls, stripMdxComments } from "@fern-api/docs-markdown-utils";
export { applyTranslatedFrontmatterToNavTree } from "./applyTranslatedFrontmatterToNavTree.js";
export { DocsDefinitionResolver, type UploadedFile } from "./DocsDefinitionResolver.js";
export { stitchGlobalTheme } from "./stitchGlobalTheme.js";
export { convertIrToApiDefinition } from "./utils/convertIrToApiDefinition.js";
export { filterOssWorkspaces } from "./utils/filterOssWorkspaces.js";
export { generateFdrFromOpenApiWorkspaceV3 } from "./utils/generateFdrFromOpenAPIWorkspaceV3.js";
export { wrapWithHttps } from "./wrapWithHttps.js";
