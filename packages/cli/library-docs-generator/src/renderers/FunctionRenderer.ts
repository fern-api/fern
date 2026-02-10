/**
 * Render PythonFunctionIr to MDX.
 *
 * Ported from servers/fdr/src/services/library-docs/renderer/python/FunctionRenderer.ts
 * Adapted to use @fern-api/fdr-sdk types (FdrAPI) instead of FdrLambda.
 *
 * Improvements over FDR server version:
 * - Uses FdrAPI types directly instead of FdrLambda
 * - Removed redundant null checks on array fields (parameters, decorators are always arrays)
 */

import type { FdrAPI } from "@fern-api/fdr-sdk";
import { generateAnchorId } from "../utils/mdx.js";
import {
    extractLinksFromTypes,
    formatSignatureMultiline,
    getModulePath,
    getTypeDisplay,
    getTypePathForSignature,
    type RenderContext,
    renderCodeBlockWithLinks,
    type SignatureParam
} from "../utils/TypeLinkResolver.js";
import { renderDocstring } from "./DocstringRenderer.js";

// ============================================================================
// Internal Helpers
// ============================================================================

interface FunctionSignature {
    code: string;
    typeStrings: string[];
}

/**
 * Build signature code and collect type strings for link extraction in one pass.
 */
function buildFunctionSignature(
    func: FdrAPI.libraryDocs.PythonFunctionIr,
    omitSelf: boolean = false
): FunctionSignature {
    const rawParams = omitSelf ? func.parameters.filter((p) => p.name !== "self" && p.name !== "cls") : func.parameters;

    const params: SignatureParam[] = [];
    const typeStrings: string[] = [];

    for (const param of rawParams) {
        const type = getTypePathForSignature(param.typeInfo) || undefined;
        if (type) {
            typeStrings.push(type);
        }
        params.push({ name: param.name, type, defaultValue: param.default ?? undefined });
    }

    const returnType = getTypePathForSignature(func.returnTypeInfo);
    if (returnType) {
        typeStrings.push(returnType);
    }

    const code = formatSignatureMultiline(func.path, params, returnType ? [returnType] : undefined);
    return { code, typeStrings };
}

/**
 * Build param annotations map for docstring rendering.
 * Uses the display name (short form) as the fallback type for docstring params.
 */
function buildParamAnnotations(func: FdrAPI.libraryDocs.PythonFunctionIr): Record<string, string> {
    const annotations: Record<string, string> = {};
    for (const param of func.parameters) {
        const typeDisplay = getTypeDisplay(param.typeInfo);
        if (typeDisplay) {
            annotations[param.name] = typeDisplay;
        }
    }
    return annotations;
}

/**
 * Get badges for special method types (async, classmethod, staticmethod, property, abstract).
 */
function getMethodBadges(func: FdrAPI.libraryDocs.PythonFunctionIr): string[] {
    const badges: string[] = [];
    if (func.isAsync) {
        badges.push("async");
    }
    if (func.isClassmethod) {
        badges.push("classmethod");
    }
    if (func.isStaticmethod) {
        badges.push("staticmethod");
    }
    if (func.isProperty) {
        badges.push("property");
    }
    if (func.decorators.some((d) => d.includes("abstractmethod"))) {
        badges.push("abstract");
    }
    return badges;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Render a module-level function in detailed form for the API section.
 */
export function renderFunctionDetailed(func: FdrAPI.libraryDocs.PythonFunctionIr, ctx: RenderContext): string {
    const lines: string[] = [];
    const currentModulePath = getModulePath(func.path);

    // Anchor
    lines.push(`<Anchor id="${generateAnchorId(func.path)}">`, "");

    // Signature with links (extracted from param/return types only)
    const { code, typeStrings } = buildFunctionSignature(func);
    const links = extractLinksFromTypes(typeStrings, ctx, currentModulePath);
    lines.push(renderCodeBlockWithLinks(code, links), "</Anchor>", "");

    // Content
    lines.push("<Indent>", "");

    // Badges
    const badges = getMethodBadges(func);
    if (badges.length > 0) {
        lines.push(badges.map((b) => `<Badge>${b}</Badge>`).join(" "), "");
    }

    // Docstring
    if (func.docstring) {
        const docstringMdx = renderDocstring(
            func.docstring,
            buildParamAnnotations(func),
            getTypeDisplay(func.returnTypeInfo) || undefined
        );
        if (docstringMdx) {
            lines.push(docstringMdx);
        }
    }

    lines.push("", "</Indent>");

    return lines.join("\n");
}

/**
 * Render a method in detailed form (for inside class definitions).
 * Omits self/cls from the signature.
 */
export function renderMethodDetailed(
    func: FdrAPI.libraryDocs.PythonFunctionIr,
    ctx: RenderContext,
    currentModulePath?: string
): string {
    const lines: string[] = [];
    const modulePath = currentModulePath ?? getModulePath(func.path);

    // Anchor
    lines.push(`<Anchor id="${generateAnchorId(func.path)}">`, "");

    // Signature with links (omit self/cls for methods)
    const { code, typeStrings } = buildFunctionSignature(func, true);
    const links = extractLinksFromTypes(typeStrings, ctx, modulePath);
    lines.push(renderCodeBlockWithLinks(code, links), "</Anchor>", "");

    // Content
    lines.push("<Indent>", "");

    // Badges
    const badges = getMethodBadges(func);
    if (badges.length > 0) {
        lines.push(badges.map((b) => `<Badge>${b}</Badge>`).join(" "), "");
    }

    // Docstring
    if (func.docstring) {
        const docstringMdx = renderDocstring(
            func.docstring,
            buildParamAnnotations(func),
            getTypeDisplay(func.returnTypeInfo) || undefined
        );
        if (docstringMdx) {
            lines.push(docstringMdx);
        }
    }

    lines.push("", "</Indent>");

    return lines.join("\n");
}

/**
 * Render a property to MDX.
 * Shows property name + type instead of a full function signature.
 */
export function renderProperty(
    func: FdrAPI.libraryDocs.PythonFunctionIr,
    ctx: RenderContext,
    currentModulePath?: string
): string {
    const lines: string[] = [];
    const modulePath = currentModulePath ?? getModulePath(func.path);

    // Property signature: name: Type
    const typeDisplay = getTypePathForSignature(func.returnTypeInfo);
    const signature = typeDisplay ? `${func.name}: ${typeDisplay}` : func.name;
    const links = typeDisplay ? extractLinksFromTypes([typeDisplay], ctx, modulePath) : {};

    // Anchor
    lines.push(`<Anchor id="${generateAnchorId(func.path)}">`, "");
    lines.push(renderCodeBlockWithLinks(signature, links), "</Anchor>", "");

    // Docstring
    if (func.docstring) {
        lines.push("<Indent>", "");
        const docstringMdx = renderDocstring(func.docstring);
        if (docstringMdx) {
            lines.push(docstringMdx);
        }
        lines.push("", "</Indent>");
    }

    return lines.join("\n");
}
