/**
 * Library Docs Generator
 *
 * Generates MDX documentation from library IR (e.g., Python, C++).
 */

export { type CppGenerateOptions, type CppGenerateResult, generateCpp } from "./CppDocsGenerator.js";
export {
    createLibraryDocsClient,
    type LibraryDocsClient,
    runLibraryDocsGeneration,
    type StepWrapper
} from "./orchestrate.js";
export { type GenerateOptions, type GenerateResult, generate } from "./PythonDocsGenerator.js";
export {
    createLibrarySymbolRenderer,
    type LibrarySymbolRendererOptions,
    type LibrarySymbolRenderRequest,
    type LibrarySymbolSource
} from "./symbols/createLibrarySymbolRenderer.js";
export {
    getLibraryIrPath,
    LIBRARY_IR_RELATIVE_PATH,
    LIBRARY_IR_SCHEMA_VERSION,
    LibraryIrReadError,
    type PersistedLibraryIr,
    readLibraryIr,
    writeLibraryIr
} from "./symbols/libraryIrFile.js";
export {
    DEFAULT_LIBRARY_SYMBOL_HEADING,
    LibrarySymbolError,
    type LibrarySymbolRequest,
    type RenderedLibrarySymbol,
    renderLibrarySymbol
} from "./symbols/renderLibrarySymbol.js";
export type { CppLibraryDocsIr } from "./types/CppLibraryDocsIr.js";
export {
    NAVIGATION_FILENAME,
    type NavNode,
    type NavPageNode,
    type NavSectionNode,
    writeNavigation
} from "./writers/NavigationBuilder.js";
