/**
 * C++ Library Docs MDX Renderer
 *
 * Entry point for the C++ renderer module.
 * Takes a C++ IR compound entry (class, struct, concept, function, enum, typedef, or variable)
 * and produces Fern-compatible MDX output. Also provides hierarchical API reference index page
 * rendering for namespace documentation (namespace indexes, category indexes, and namespaces
 * indexes).
 */

export type { CompoundMeta, RenderContext } from "./context.js";
export { buildLinkPath, getShortName } from "./context.js";
export { renderClassPage } from "./renderers/ClassPageRenderer.js";
export type { CppCompoundIr } from "./renderers/CompoundPageRenderer.js";
export { renderCompoundPage } from "./renderers/CompoundPageRenderer.js";
export { renderConceptPage } from "./renderers/ConceptPageRenderer.js";
export { renderSegmentsPlainText, renderSegmentsTrimmed } from "./renderers/DescriptionRenderer.js";
export { renderEnumPage } from "./renderers/EnumPageRenderer.js";
export { renderFunctionPage } from "./renderers/FunctionPageRenderer.js";
export type { CategoryDefinition, CategoryWithEntries, EntityEntry } from "./renderers/IndexPageRenderer.js";
export {
    ENTITY_CATEGORIES,
    namespaceHasEntities,
    renderCategoryIndexPage,
    renderNamespaceIndexPage,
    renderNamespacesIndexPage
} from "./renderers/IndexPageRenderer.js";
export { renderTypedefPage } from "./renderers/TypedefPageRenderer.js";
export { renderVariablePage } from "./renderers/VariablePageRenderer.js";
