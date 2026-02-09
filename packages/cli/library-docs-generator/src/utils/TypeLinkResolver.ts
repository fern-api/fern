/**
 * TypeLinkResolver - Generate links and format signatures for Python library docs.
 *
 * Ported from servers/fdr/src/services/library-docs/renderer/python/TypeLinkResolver.ts
 * Adapted to use @fern-api/fdr-sdk types (FdrAPI) instead of FdrLambda.
 */

import type { FdrAPI } from "@fern-api/fdr-sdk";
import { escapeMdx, generateAnchorId } from "./mdx.js";

// ============================================================================
// Render Context
// ============================================================================

/**
 * Shared context for rendering, passed to all render functions.
 */
export interface RenderContext {
    baseSlug: string;
    validPaths: Set<string>;
    /** Maps re-exported paths to their actual definition paths */
    pathAliases: Map<string, string>;
}

/**
 * Result of processing the IR for type linking.
 */
export interface TypeLinkData {
    /** All valid definition paths that can be linked to */
    validPaths: Set<string>;
    /** Maps re-exported paths to their actual definition paths */
    pathAliases: Map<string, string>;
}

// ============================================================================
// Build Type Link Data
// ============================================================================

/**
 * Build valid paths and path aliases from the IR in a single traversal.
 * - validPaths: all definition paths (modules, classes, functions, attributes)
 * - pathAliases: maps re-exported paths to actual definitions (e.g., pkg.Foo -> pkg.sub.Foo)
 */
export function buildTypeLinkData(ir: FdrAPI.libraryDocs.PythonLibraryDocsIr): TypeLinkData {
    const validPaths = new Set<string>();
    const pathAliases = new Map<string, string>();

    function addTypeInfo(typeInfo: FdrAPI.libraryDocs.TypeInfo | undefined): void {
        if (typeInfo?.resolvedPath && typeInfo.basePath && typeInfo.resolvedPath !== typeInfo.basePath) {
            pathAliases.set(typeInfo.resolvedPath, typeInfo.basePath);
        }
    }

    function processFunction(func: FdrAPI.libraryDocs.PythonFunctionIr): void {
        validPaths.add(func.path);
        for (const param of func.parameters) {
            addTypeInfo(param.typeInfo);
        }
        addTypeInfo(func.returnTypeInfo);
    }

    function processModule(module: FdrAPI.libraryDocs.PythonModuleIr): void {
        validPaths.add(module.path);

        for (const cls of module.classes) {
            validPaths.add(cls.path);
            for (const base of cls.bases) {
                addTypeInfo(base.typeInfo);
            }
            for (const method of cls.methods) {
                processFunction(method);
            }
            for (const attr of cls.attributes) {
                addTypeInfo(attr.typeInfo);
            }
        }

        for (const func of module.functions) {
            processFunction(func);
        }

        for (const attr of module.attributes) {
            validPaths.add(attr.path);
            addTypeInfo(attr.typeInfo);
        }

        for (const sub of module.submodules) {
            processModule(sub);
        }
    }

    processModule(ir.rootModule);

    return { validPaths, pathAliases };
}

// ============================================================================
// Path Utilities
// ============================================================================

/**
 * Extract module path from a fully qualified path.
 * e.g., "nemo_rl.algorithms.dpo.SomeClass" -> "nemo_rl.algorithms.dpo"
 */
export function getModulePath(path: string): string {
    const parts = path.split(".");
    return parts.slice(0, -1).join(".");
}

/**
 * Generate anchor URL from a qualified type path.
 */
function pathToAnchorUrl(typePath: string, baseSlug: string, currentModulePath?: string): string | null {
    const parts = typePath.split(".");
    if (parts.length < 2) {
        return null;
    }

    const anchor = generateAnchorId(typePath);
    const targetModulePath = parts.slice(0, -1).join(".");

    if (currentModulePath && targetModulePath === currentModulePath) {
        return `#${anchor}`;
    }

    return `/${baseSlug}/${parts.slice(0, -1).join("/")}#${anchor}`;
}

// ============================================================================
// Link Extraction
// ============================================================================

/** Regex to match qualified Python paths (at least 2 segments). */
const QUALIFIED_PATH_REGEX = /[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)+/g;

/**
 * Extract links from type strings (params and return types).
 * Only scans the provided type strings, not the full signature.
 * Handles re-exported types by resolving aliases to their actual definition paths.
 */
export function extractLinksFromTypes(
    typeStrings: string[],
    ctx: RenderContext,
    currentModulePath?: string
): Record<string, string> {
    const links: Record<string, string> = {};

    for (const typeStr of typeStrings) {
        if (!typeStr) {
            continue;
        }
        const matches = typeStr.match(QUALIFIED_PATH_REGEX) || [];

        for (const path of matches) {
            if (links[path]) {
                continue;
            }

            // Try direct path first, then resolve via alias map for re-exports
            let actualPath = path;
            if (!ctx.validPaths.has(path)) {
                const aliasedPath = ctx.pathAliases.get(path);
                if (aliasedPath && ctx.validPaths.has(aliasedPath)) {
                    actualPath = aliasedPath;
                } else {
                    continue;
                }
            }

            // Generate URL using the actual definition path
            const url = pathToAnchorUrl(actualPath, ctx.baseSlug, currentModulePath);
            if (url) {
                // Key is the original path (for text replacement in the code block)
                links[path] = url;
            }
        }
    }

    return links;
}

// ============================================================================
// TypeInfo Helpers (for tables, docstrings)
// ============================================================================

/**
 * Get display string from TypeInfo (short name for tables/docstrings).
 */
export function getTypeDisplay(typeInfo: FdrAPI.libraryDocs.TypeInfo | undefined): string {
    if (!typeInfo) {
        return "";
    }
    return typeInfo.display ?? typeInfo.resolvedPath ?? "";
}

/**
 * Get fully qualified type path from TypeInfo (for signatures).
 */
export function getTypePathForSignature(typeInfo: FdrAPI.libraryDocs.TypeInfo | undefined): string {
    if (!typeInfo) {
        return "";
    }
    return typeInfo.resolvedPath ?? typeInfo.display ?? "";
}

/**
 * Generate a markdown link from TypeInfo (for tables, base classes).
 */
export function linkTypeInfo(
    typeInfo: FdrAPI.libraryDocs.TypeInfo | undefined,
    ctx: RenderContext,
    currentModulePath?: string
): string {
    if (!typeInfo) {
        return "-";
    }

    const displayName = typeInfo.display ?? typeInfo.resolvedPath;
    if (!displayName) {
        return "-";
    }

    // Only link if basePath exists in our docs
    if (typeInfo.basePath && ctx.validPaths.has(typeInfo.basePath)) {
        const url = pathToAnchorUrl(typeInfo.basePath, ctx.baseSlug, currentModulePath);
        if (url) {
            return `[${escapeMdx(displayName)}](${url})`;
        }
    }

    return `\`${escapeMdx(displayName)}\``;
}

// ============================================================================
// CodeBlock Rendering
// ============================================================================

/**
 * Render code in a CodeBlock component with optional type links.
 */
export function renderCodeBlockWithLinks(code: string, links: Record<string, string>): string {
    const hasLinks = Object.keys(links).length > 0;
    const linksAttr = hasLinks ? ` links={${JSON.stringify(links)}}` : "";

    return [
        `<CodeBlock${linksAttr} showLineNumbers={false} wordWrap={true}>`,
        "",
        "```python",
        code,
        "```",
        "",
        "</CodeBlock>"
    ].join("\n");
}

// ============================================================================
// Signature Formatting
// ============================================================================

export interface SignatureParam {
    name: string;
    type?: string;
    defaultValue?: string;
}

const MAX_DEFAULT_LENGTH = 30;

/**
 * Format a signature with parameters on separate lines.
 */
export function formatSignatureMultiline(header: string, params: SignatureParam[], returns?: string[]): string {
    let returnStr = "";
    if (returns && returns.length > 0) {
        returnStr = returns.length === 1 ? ` -> ${returns[0]}` : ` -> tuple[${returns.join(", ")}]`;
    }

    if (params.length === 0) {
        return `${header}()${returnStr}`;
    }

    const paramLines = params.map((param, i) => {
        const typeStr = param.type ? `: ${param.type}` : "";
        let defaultStr = "";
        if (param.defaultValue) {
            const truncated =
                param.defaultValue.length > MAX_DEFAULT_LENGTH
                    ? param.defaultValue.slice(0, MAX_DEFAULT_LENGTH - 3) + "..."
                    : param.defaultValue;
            defaultStr = ` = ${truncated}`;
        }
        const comma = i < params.length - 1 ? "," : "";
        return `    ${param.name}${typeStr}${defaultStr}${comma}`;
    });

    return [`${header}(`, ...paramLines, `)${returnStr}`].join("\n");
}
