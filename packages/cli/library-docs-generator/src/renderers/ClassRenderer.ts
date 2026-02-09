/**
 * Render PythonClassIr to MDX.
 *
 * Ported from servers/fdr/src/services/library-docs/renderer/python/ClassRenderer.ts
 * Adapted to use @fern-api/fdr-sdk types (FdrAPI) instead of FdrLambda.
 *
 * Improvements over FDR server version:
 * - Uses FdrAPI types directly instead of FdrLambda
 * - Uses `??` instead of `||` for null coalescing on `param.default` (avoids false-positive on empty string defaults)
 * - Removed redundant null checks on array fields (constructorParams, methods, attributes, bases are always arrays)
 */

import type { FdrAPI } from "@fern-api/fdr-sdk";
import { escapeMdx, generateAnchorId } from "../utils/mdx.js";
import {
    extractLinksFromTypes,
    formatSignatureMultiline,
    getModulePath,
    getTypeDisplay,
    getTypePathForSignature,
    linkTypeInfo,
    type RenderContext,
    renderCodeBlockWithLinks,
    type SignatureParam
} from "../utils/TypeLinkResolver.js";
import { renderDocstring, renderSimpleDocstring } from "./DocstringRenderer.js";
import { renderMethodDetailed, renderProperty } from "./FunctionRenderer.js";

// ============================================================================
// Internal Helpers
// ============================================================================

interface ClassSignature {
    code: string;
    typeStrings: string[];
}

/**
 * Build class signature and collect type strings for link extraction in one pass.
 */
function buildClassSignature(cls: FdrAPI.libraryDocs.PythonClassIr): ClassSignature {
    const params: SignatureParam[] = [];
    const typeStrings: string[] = [];

    for (const param of cls.constructorParams) {
        const type = getTypePathForSignature(param.typeInfo) || undefined;
        if (type) {
            typeStrings.push(type);
        }
        params.push({ name: param.name, type, defaultValue: param.default ?? undefined });
    }

    const code = formatSignatureMultiline(`class ${cls.path}`, params);
    return { code, typeStrings };
}

/**
 * Build param annotations for docstring rendering.
 */
function buildParamAnnotations(cls: FdrAPI.libraryDocs.PythonClassIr): Record<string, string> {
    const annotations: Record<string, string> = {};
    for (const param of cls.constructorParams) {
        const typeDisplay = getTypeDisplay(param.typeInfo);
        if (typeDisplay) {
            annotations[param.name] = typeDisplay;
        }
    }
    return annotations;
}

/**
 * Get kind badges for a class.
 */
function getClassBadges(cls: FdrAPI.libraryDocs.PythonClassIr): string[] {
    const badges: string[] = [];
    if (cls.kind === "PROTOCOL") {
        badges.push("Protocol");
    }
    if (cls.kind === "DATACLASS") {
        badges.push("Dataclass");
    }
    if (cls.kind === "EXCEPTION") {
        badges.push("Exception");
    }
    if (cls.isAbstract) {
        badges.push("Abstract");
    }
    return badges;
}

/**
 * Render base classes as markdown links.
 */
function renderBases(
    cls: FdrAPI.libraryDocs.PythonClassIr,
    ctx: RenderContext,
    currentModulePath: string
): string | null {
    if (cls.bases.length === 0 || ["TYPEDDICT", "ENUM"].includes(cls.kind)) {
        return null;
    }

    const interestingBases = cls.bases.filter((b) => !["object", "ABC", "Protocol", "TypedDict"].includes(b.name));
    if (interestingBases.length === 0) {
        return null;
    }

    const basesStr = interestingBases
        .map((b) => (b.typeInfo ? linkTypeInfo(b.typeInfo, ctx, currentModulePath) : `\`${b.name}\``))
        .join(", ");

    return `**Bases:** ${basesStr}`;
}

/**
 * Check if an attribute is meaningful (not just a redundant assignment).
 */
function isAttributeMeaningful(attr: FdrAPI.libraryDocs.AttributeIr): boolean {
    if (attr.value && attr.value === attr.name) {
        return false;
    }
    if (attr.docstring) {
        return true;
    }
    const typeDisplay = getTypeDisplay(attr.typeInfo);
    if (typeDisplay && typeDisplay !== "Any") {
        return true;
    }
    if (attr.value && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(attr.value)) {
        return true;
    }
    return false;
}

/**
 * Render an attribute using ParamField component.
 */
function renderAttribute(attr: FdrAPI.libraryDocs.AttributeIr): string {
    const typeDisplay = getTypeDisplay(attr.typeInfo);
    const defaultValue = attr.value && attr.value.length <= 50 ? attr.value : undefined;

    let typeStr = typeDisplay || "";
    if (defaultValue) {
        typeStr = typeStr ? `${typeStr} = ${defaultValue}` : `= ${defaultValue}`;
    }

    const props = [`path="${attr.name}"`];
    if (typeStr) {
        props.push(`type="${escapeMdx(typeStr)}"`);
    }

    const lines = [`<ParamField ${props.join(" ")}>`];
    if (attr.docstring) {
        const docMdx = renderSimpleDocstring(attr.docstring);
        if (docMdx) {
            lines.push(docMdx);
        }
    }
    lines.push("</ParamField>");

    return lines.join("\n");
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Render a class in detailed form for the API section.
 * Dispatches to specialized renderers based on class kind.
 */
export function renderClassDetailed(cls: FdrAPI.libraryDocs.PythonClassIr, ctx: RenderContext): string {
    switch (cls.kind) {
        case "TYPEDDICT":
            return renderTypedDictDetailed(cls, ctx);
        case "ENUM":
            return renderEnumDetailed(cls);
        default:
            return renderRegularClassDetailed(cls, ctx);
    }
}

/**
 * Render a regular class, protocol, dataclass, or exception.
 */
function renderRegularClassDetailed(cls: FdrAPI.libraryDocs.PythonClassIr, ctx: RenderContext): string {
    const lines: string[] = [];
    const currentModulePath = getModulePath(cls.path);

    // Anchor
    lines.push(`<Anchor id="${generateAnchorId(cls.path)}">`, "");

    // Signature with links (extracted from constructor param types only)
    const { code, typeStrings } = buildClassSignature(cls);
    const links = extractLinksFromTypes(typeStrings, ctx, currentModulePath);
    lines.push(renderCodeBlockWithLinks(code, links), "</Anchor>", "");

    // Content
    lines.push("<Indent>", "");

    // Badges
    const badges = getClassBadges(cls);
    if (badges.length > 0) {
        lines.push(badges.map((b) => `<Badge>${b}</Badge>`).join(" "), "");
    }

    // Base classes
    const basesLine = renderBases(cls, ctx, currentModulePath);
    if (basesLine) {
        lines.push(basesLine, "");
    }

    // Docstring
    if (cls.docstring) {
        const docMdx = renderDocstring(cls.docstring, buildParamAnnotations(cls));
        if (docMdx) {
            lines.push(docMdx, "");
        }
    }

    // Attributes — blank line between attributes but not after last one
    const attrs = cls.attributes.filter(isAttributeMeaningful);
    for (let i = 0; i < attrs.length; i++) {
        const attr = attrs[i];
        if (attr) {
            lines.push(renderAttribute(attr));
        }
        if (i < attrs.length - 1) {
            lines.push("");
        }
    }

    // Methods — no extra blank lines since </Indent> adds margin
    const methods = cls.methods.filter((m) => m.name !== "__init__");
    for (const method of methods) {
        lines.push(
            method.isProperty
                ? renderProperty(method, ctx, currentModulePath)
                : renderMethodDetailed(method, ctx, currentModulePath)
        );
    }

    lines.push("</Indent>");

    return lines.join("\n");
}

/**
 * Render a TypedDict class.
 */
function renderTypedDictDetailed(cls: FdrAPI.libraryDocs.PythonClassIr, _ctx: RenderContext): string {
    const lines: string[] = [];

    lines.push(`<Anchor id="${generateAnchorId(cls.path)}">`, "");
    lines.push(renderCodeBlockWithLinks(`class ${cls.path}`, {}), "</Anchor>", "");

    lines.push("<Indent>", "");
    lines.push("**Bases:** `typing.TypedDict`", "");

    if (cls.docstring) {
        const docMdx = renderSimpleDocstring(cls.docstring);
        if (docMdx) {
            lines.push(docMdx, "");
        }
    }

    if (cls.typedDictFields && cls.typedDictFields.length > 0) {
        for (const field of cls.typedDictFields) {
            const typeDisplay = getTypeDisplay(field.typeInfo) || "Any";
            lines.push(
                `<ParamField path="${field.name}" type="${escapeMdx(typeDisplay)}">`,
                field.description ? escapeMdx(field.description) : "",
                "</ParamField>",
                ""
            );
        }
    }

    lines.push("</Indent>");

    return lines.join("\n");
}

/**
 * Render an Enum class.
 */
function renderEnumDetailed(cls: FdrAPI.libraryDocs.PythonClassIr): string {
    const lines: string[] = [];

    lines.push(`<Anchor id="${generateAnchorId(cls.path)}">`, "");
    lines.push(renderCodeBlockWithLinks(`class ${cls.path}`, {}), "</Anchor>", "");

    lines.push("<Indent>", "");
    lines.push("**Bases:** `enum.Enum`", "");

    if (cls.docstring) {
        const docMdx = renderSimpleDocstring(cls.docstring);
        if (docMdx) {
            lines.push(docMdx, "");
        }
    }

    if (cls.enumMembers && cls.enumMembers.length > 0) {
        for (const member of cls.enumMembers) {
            lines.push(`<ParamField path="${member.name}" type="= ${escapeMdx(member.value)}">`, "</ParamField>", "");
        }
    }

    lines.push("</Indent>");

    return lines.join("\n");
}
