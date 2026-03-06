/**
 * Library Docs Generator
 *
 * Generates MDX documentation from library IR (e.g., Python, C++).
 */

export { type CppGenerateOptions, type CppGenerateResult, generateCpp } from "./CppDocsGenerator.js";
export { type GenerateOptions, type GenerateResult, generate } from "./PythonDocsGenerator.js";
export type { CppLibraryDocsIr } from "./types/CppLibraryDocsIr.js";
export {
    NAVIGATION_FILENAME,
    type NavNode,
    type NavPageNode,
    type NavSectionNode,
    writeNavigation
} from "./writers/NavigationBuilder.js";
