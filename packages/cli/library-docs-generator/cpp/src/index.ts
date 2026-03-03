/**
 * C++ Library Docs MDX Renderer
 *
 * Entry point for the C++ renderer module.
 * Takes a C++ IR compound entry (class/concept) and produces Fern-compatible MDX output.
 */

export { renderClassPage } from "./renderers/ClassPageRenderer.js";
export { renderConceptPage } from "./renderers/ConceptPageRenderer.js";
export { renderCompoundPage } from "./renderers/CompoundPageRenderer.js";
export type { CppCompoundIr } from "./renderers/CompoundPageRenderer.js";
export type { RenderContext, CompoundMeta } from "./context.js";
export { createRenderContext, buildLinkPath, getShortName } from "./context.js";
