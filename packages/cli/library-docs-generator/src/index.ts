/**
 * Library Docs Generator
 *
 * Generates MDX documentation from library IR (e.g., Python, C++).
 */

export { type GenerateOptions, type GenerateResult, generate } from "./PythonDocsGenerator.js";
export type { NavNode, NavPageNode, NavSectionNode } from "./writers/NavigationBuilder.js";
