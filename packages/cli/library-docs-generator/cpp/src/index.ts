/**
 * C++ Library Docs MDX Renderer
 *
 * Entry point for the C++ renderer module.
 * Takes a C++ IR compound entry (class/concept) and produces Fern-compatible MDX output.
 */

export type { CompoundMeta, RenderContext } from "./context.js";
export { buildLinkPath, getShortName } from "./context.js";
export { renderClassPage } from "./renderers/ClassPageRenderer.js";
export type { CppCompoundIr } from "./renderers/CompoundPageRenderer.js";
export { renderCompoundPage } from "./renderers/CompoundPageRenderer.js";
export { renderConceptPage } from "./renderers/ConceptPageRenderer.js";
export { renderSegmentsTrimmed } from "./renderers/DescriptionRenderer.js";
export { renderEnumPage } from "./renderers/EnumPageRenderer.js";
export { renderFunctionPage } from "./renderers/FunctionPageRenderer.js";
export { renderTypedefPage } from "./renderers/TypedefPageRenderer.js";
export { renderVariablePage } from "./renderers/VariablePageRenderer.js";
