/**
 * Library Docs Generator
 *
 * Generates MDX documentation from library IR (e.g., Python, C++).
 */

export { type GenerateOptions, type GenerateResult, generate } from "./PythonDocsGenerator.js";
export {
    NAVIGATION_FILENAME,
    type NavNode,
    type NavPageNode,
    type NavSectionNode,
    writeNavigation
} from "./writers/NavigationBuilder.js";
