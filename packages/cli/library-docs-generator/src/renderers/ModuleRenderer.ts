/**
 * Render PythonModuleIr to MDX pages.
 *
 * Ported from servers/fdr/src/services/library-docs/renderer/python/ModuleRenderer.ts
 * Adapted to use @fern-api/fdr-sdk types (FdrAPI) instead of FdrLambda.
 *
 * Layout per module page:
 * 1. Frontmatter (slug + title from module.path)
 * 2. Module docstring
 * 3. Subpackages / Submodules links
 * 4. Module Contents — summary tables for classes, functions, data
 * 5. API — detailed definitions with anchors
 *
 * Improvements over FDR server version:
 * - Uses FdrAPI types directly instead of FdrLambda
 * - Removed redundant null checks on array fields (submodules, classes, functions, attributes are always arrays)
 */

import type { FdrAPI } from "@fern-api/fdr-sdk";
import { createFrontmatter, escapeTableCell, generateAnchorId } from "../utils/mdx.js";
import {
    extractLinksFromTypes,
    getTypeDisplay,
    type RenderContext,
    renderCodeBlockWithLinks
} from "../utils/TypeLinkResolver.js";
import { renderClassDetailed } from "./ClassRenderer.js";
import { renderSimpleDocstring } from "./DocstringRenderer.js";
import { renderFunctionDetailed } from "./FunctionRenderer.js";

/**
 * Render a list of submodules, split into Subpackages (have children) and Submodules (leaf nodes).
 * This matches Python/Sphinx conventions where packages contain other modules.
 */
function renderSubmodulesSection(
    submodules: FdrAPI.libraryDocs.PythonModuleIr[],
    baseSlug: string,
    modulePath: string
): string {
    const lines: string[] = [];

    const packages = submodules.filter((sub) => sub.submodules.length > 0);
    const modules = submodules.filter((sub) => sub.submodules.length === 0);

    const renderItem = (sub: FdrAPI.libraryDocs.PythonModuleIr): string => {
        const link = `/${baseSlug}/${modulePath}/${sub.name}`;
        return `- **[\`${sub.path}\`](${link})**`;
    };

    if (packages.length > 0) {
        lines.push("## Subpackages", "");
        for (const pkg of packages) {
            lines.push(renderItem(pkg));
        }
        lines.push("");
    }

    if (modules.length > 0) {
        lines.push("## Submodules", "");
        for (const mod of modules) {
            lines.push(renderItem(mod));
        }
        lines.push("");
    }

    return lines.join("\n");
}

/**
 * Render a module-level attribute/constant in detail.
 */
function renderAttributeDetailed(attr: FdrAPI.libraryDocs.AttributeIr, ctx: RenderContext): string {
    const lines: string[] = [];

    const anchorId = generateAnchorId(attr.path);
    const pathParts = attr.path.split(".");
    const currentModulePath = pathParts.slice(0, -1).join(".");

    lines.push(`<Anchor id="${anchorId}">`, "");

    // Signature: path: Type = value
    const attrTypeDisplay = getTypeDisplay(attr.typeInfo);
    const typeStr = attrTypeDisplay ? `: ${attrTypeDisplay}` : "";
    const maxValueLength = 80;
    const valueStr = attr.value
        ? ` = ${attr.value.length > maxValueLength ? attr.value.slice(0, maxValueLength) + "..." : attr.value}`
        : "";

    const signature = `${attr.path}${typeStr}${valueStr}`;
    const links = attrTypeDisplay ? extractLinksFromTypes([attrTypeDisplay], ctx, currentModulePath) : {};
    lines.push(renderCodeBlockWithLinks(signature, links), "</Anchor>", "");

    // Docstring
    if (attr.docstring) {
        lines.push("<Indent>", "");
        const docstringMdx = renderSimpleDocstring(attr.docstring);
        if (docstringMdx) {
            lines.push(docstringMdx);
        }
        lines.push("", "</Indent>");
    }

    return lines.join("\n");
}

/**
 * Render a single module to an MDX page.
 */
export function renderModulePage(
    module: FdrAPI.libraryDocs.PythonModuleIr,
    ctx: RenderContext,
    parentPath: string = ""
): string {
    const lines: string[] = [];

    const modulePath = parentPath ? `${parentPath}/${module.name}` : module.name;
    const slug = `${ctx.baseSlug}/${modulePath}`;

    // Frontmatter (includes title, so no separate H1 needed)
    lines.push(createFrontmatter(slug, module.path), "");

    // Module docstring
    if (module.docstring) {
        const docstringMdx = renderSimpleDocstring(module.docstring);
        if (docstringMdx) {
            lines.push(docstringMdx, "");
        }
    }

    // Submodules section (before Module Contents)
    if (module.submodules.length > 0) {
        lines.push(renderSubmodulesSection(module.submodules, ctx.baseSlug, modulePath));
    }

    // Content sections
    const hasClasses = module.classes.length > 0;
    const hasFunctions = module.functions.length > 0;
    const hasAttributes = module.attributes.length > 0;
    const hasContent = hasClasses || hasFunctions || hasAttributes;

    if (hasContent) {
        const contentsHeader = module.submodules.length > 0 ? "Package Contents" : "Module Contents";
        lines.push(`## ${contentsHeader}`, "");

        // Classes summary table
        if (hasClasses) {
            lines.push("### Classes", "", "| Name | Description |", "|------|-------------|");
            for (const cls of module.classes) {
                const anchorId = generateAnchorId(cls.path);
                const description = cls.docstring?.summary ? escapeTableCell(cls.docstring.summary) : "-";
                lines.push(`| [\`${cls.name}\`](#${anchorId}) | ${description} |`);
            }
            lines.push("");
        }

        // Functions summary table
        if (hasFunctions) {
            lines.push("### Functions", "", "| Name | Description |", "|------|-------------|");
            for (const func of module.functions) {
                const anchorId = generateAnchorId(func.path);
                const description = func.docstring?.summary ? escapeTableCell(func.docstring.summary) : "-";
                lines.push(`| [\`${func.name}\`](#${anchorId}) | ${description} |`);
            }
            lines.push("");
        }

        // Data/Constants summary
        if (hasAttributes) {
            lines.push("### Data", "");
            for (const attr of module.attributes) {
                const anchorId = generateAnchorId(attr.path);
                lines.push(`[\`${attr.name}\`](#${anchorId})`, "");
            }
        }

        // API section with detailed definitions
        lines.push("### API", "");

        for (const cls of module.classes) {
            lines.push(renderClassDetailed(cls, ctx), "");
        }

        for (const func of module.functions) {
            lines.push(renderFunctionDetailed(func, ctx), "");
        }

        for (const attr of module.attributes) {
            lines.push(renderAttributeDetailed(attr, ctx), "");
        }
    }

    return lines.join("\n");
}

/**
 * Recursively render all modules to pages.
 * Returns a map from file path (e.g., "reference/python/nemo_rl/algorithms.mdx") to MDX content.
 */
export function renderAllModulePages(
    rootModule: FdrAPI.libraryDocs.PythonModuleIr,
    ctx: RenderContext
): Record<string, string> {
    const pages: Record<string, string> = {};

    function renderModule(module: FdrAPI.libraryDocs.PythonModuleIr, parentPath: string = ""): void {
        const modulePath = parentPath ? `${parentPath}/${module.name}` : module.name;

        const hasDirectContent =
            module.classes.length > 0 ||
            module.functions.length > 0 ||
            module.attributes.length > 0 ||
            module.docstring != null;

        const hasSubmodules = module.submodules.length > 0;

        // Generate page if module has any documentable content
        if (hasDirectContent || hasSubmodules) {
            const pageKey = `${ctx.baseSlug}/${modulePath}.mdx`;
            pages[pageKey] = renderModulePage(module, ctx, parentPath);
        }

        for (const submodule of module.submodules) {
            renderModule(submodule, modulePath);
        }
    }

    renderModule(rootModule);
    return pages;
}
