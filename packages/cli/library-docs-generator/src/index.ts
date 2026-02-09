/**
 * Library Docs Generator
 *
 * Generates MDX documentation from library IR (e.g., Python, C++).
 */

export { generate, type GenerateOptions, type GenerateResult } from "./PythonDocsGenerator.js";
export type { NavNode, NavPageNode, NavSectionNode } from "./writers/NavigationBuilder.js";
