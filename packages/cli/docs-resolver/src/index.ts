import { type docsYml } from "@fern-api/configuration";

// Re-export markdown utilities needed for translation processing
export {
    replaceImagePathsAndUrls,
    replaceReferencedCode,
    replaceReferencedMarkdown,
    stripMdxComments,
    transformAtPrefixImports
} from "@fern-api/docs-markdown-utils";
export { applyTranslatedApiTitlesToNavTree } from "./applyTranslatedApiTitlesToNavTree.js";
export { applyTranslatedFrontmatterToNavTree } from "./applyTranslatedFrontmatterToNavTree.js";
export {
    applyTranslatedNavigationOverlays,
    getTranslatedAnnouncement
} from "./applyTranslatedNavigationOverlays.js";
export type TranslationNavigationOverlay = docsYml.TranslationNavigationOverlay;
export {
    DocsDefinitionResolver,
    type RegisterApiFn,
    type TranslatedApiSpec,
    type UploadedFile
} from "./DocsDefinitionResolver.js";
export { stitchGlobalTheme } from "./stitchGlobalTheme.js";
export { convertIrToApiDefinition } from "./utils/convertIrToApiDefinition.js";
export {
    DECLARED_SKILLS_UPLOAD_DIRECTORY,
    type DeclaredSkill,
    type DeclaredSkillFile,
    type DeclaredSkillsViolation,
    type DiscoveredDeclaredSkills,
    discoverDeclaredSkills,
    generateSkillsIndexManifest,
    validateSkillFrontmatter
} from "./utils/declaredSkills.js";
export { filterOssWorkspaces } from "./utils/filterOssWorkspaces.js";
export { generateFdrFromOpenApiWorkspaceV3 } from "./utils/generateFdrFromOpenAPIWorkspaceV3.js";
export { updateApiDefinitionIdInTree } from "./utils/resolveDescriptionLinks.js";
export { wrapWithHttps } from "./wrapWithHttps.js";
