/**
 * Renders a full C++ class/struct page as MDX.
 *
 * Page structure:
 * 1. Frontmatter (title + description)
 * 2. Preamble (before first ---)
 *    - Summary paragraphs
 *    - Include header (bare code block)
 *    - Callouts (deprecated, warnings, notes)
 *    - See also
 *    - Example (H2, class-level)
 *    - Template parameters (bold heading + ParamFields)
 *    - Inherits from
 *    - Final/abstract annotation
 * 3. Body sections (each separated by ---)
 *    - Driven by IR sectionLabels and member groupings
 *    - Constructors, Assignment operators, Methods, Types, Member variables, Inner classes, etc.
 */

import type { CppClassIr, CppFunctionIr } from "../../../src/types/CppLibraryDocsIr.js";
import type { CompoundMeta, RenderContext } from "../context.js";
import { buildLinkPath, clearClassMembers, getShortName, registerClassMembers, stripTemplateArgs } from "../context.js";
import { renderBadge } from "./BadgeRenderer.js";
import {
    renderDescriptionBlocksDeduped,
    renderSeeAlso,
    renderSegmentsPlainText,
    renderSegmentsTrimmed,
    setCurrentPagePath
} from "./DescriptionRenderer.js";
import {
    groupFunctionsByName,
    renderDestructor,
    renderOverloadedMethod,
    renderSingleMethod
} from "./MethodRenderer.js";
import { renderClassTemplateParams } from "./ParamRenderer.js";
import { renderBareCodeBlock, renderClassTemplateSignature } from "./SignatureRenderer.js";
import {
    escapeMdxText,
    renderCallout,
    renderFrontmatter as renderFrontmatterLines,
    trimTrailingBlankLines
} from "./shared.js";
import { renderEnum, renderInnerClass, renderMemberVariableTable, renderTypedefTable } from "./TableRenderer.js";

// ---------------------------------------------------------------------------
// Frontmatter
// ---------------------------------------------------------------------------

/**
 * Generate YAML frontmatter for a class page.
 */
function renderClassFrontmatter(cls: CppClassIr, meta: CompoundMeta): string {
    // Description is expected to be provided by the caller (pipeline/Lambda); fallback extracts from docstring summary
    const description = meta.description ?? (cls.docstring ? renderSegmentsPlainText(cls.docstring.summary) : "");

    return renderFrontmatterLines(cls.path, description).join("\n");
}

// ---------------------------------------------------------------------------
// Preamble
// ---------------------------------------------------------------------------

/**
 * Render the preamble section (before the first --- separator).
 */
function renderPreamble(cls: CppClassIr, ctx: RenderContext): string {
    const lines: string[] = [];
    const docstring = cls.docstring;

    // 1. Class template signature (if this is a templated class) - MUST BE FIRST
    const templateSignature = renderClassTemplateSignature(cls, ctx);
    if (templateSignature) {
        lines.push(templateSignature);
        lines.push("");
    }

    // 2. Summary paragraphs and description blocks
    if (docstring) {
        if (docstring.summary.length > 0) {
            const summary = renderSegmentsTrimmed(docstring.summary);
            if (summary) {
                lines.push(summary);
                lines.push("");
            }
        }

        if (docstring.description.length > 0) {
            const desc = renderDescriptionBlocksDeduped(docstring.description, docstring.summary, {
                titledSectionHeadingLevel: 2
            });
            if (desc) {
                lines.push(desc);
                lines.push("");
            }
        }
    }

    // 3. Include header (prepend namespace path prefix)
    if (cls.includeHeader) {
        const namespacePath = ctx.meta.namespacePath;
        const prefix = namespacePath.length > 0 ? namespacePath.join("/") + "/" : "";
        lines.push(renderBareCodeBlock(`#include <${prefix}${cls.includeHeader}>`, "cpp"));
        lines.push("");
    }

    // 4. Callouts
    // Deprecated
    if (docstring?.deprecated) {
        const depText = renderSegmentsTrimmed(docstring.deprecated);
        if (depText) {
            lines.push(...renderCallout("Error", depText, "Deprecated"));
        }
    }

    // Warnings
    if (docstring?.warnings) {
        for (const warning of docstring.warnings) {
            const text = renderSegmentsTrimmed(warning);
            if (text) {
                lines.push(...renderCallout("Warning", text));
            }
        }
    }

    // Notes
    if (docstring?.notes) {
        for (const note of docstring.notes) {
            const text = renderSegmentsTrimmed(note);
            if (text) {
                lines.push(...renderCallout("Note", text));
            }
        }
    }

    // 5. See also (class-level) -- multi-line format
    if (docstring?.seeAlso && docstring.seeAlso.length > 0) {
        const seeAlsoBlock = renderSeeAlso(docstring.seeAlso);
        if (seeAlsoBlock) {
            lines.push(seeAlsoBlock);
        }
    }

    // 6. Class-level examples
    if (docstring?.examples && docstring.examples.length > 0) {
        lines.push("## Example");
        lines.push("");
        for (const example of docstring.examples) {
            const lang = example.language || "cpp";
            lines.push(renderBareCodeBlock(example.code, lang));
            lines.push("");
        }
    }

    // 7. Template parameters (bold heading + ParamFields)
    if (cls.templateParams.length > 0) {
        const tplParams = renderClassTemplateParams(cls.templateParams, cls.docstring);
        if (tplParams) {
            lines.push(tplParams);
            lines.push("");
        }
    }

    // 8. Inherits from
    if (cls.baseClasses.length > 0) {
        const baseLinks = cls.baseClasses.map((bc) => {
            const access = `(${bc.access})`;
            // Display text preserves template args; URL strips them
            const displayText = bc.typeInfo?.display ?? bc.name;
            if (bc.typeInfo?.resolvedPath) {
                const linkUrl = buildLinkPath(stripTemplateArgs(bc.typeInfo.resolvedPath));
                if (linkUrl) {
                    return `[\`${displayText}\`](${linkUrl}) ${access}`;
                }
            }
            // No resolved path -- render as plain inline code (no broken link)
            return `\`${displayText}\` ${access}`;
        });
        lines.push(`**Inherits from:** ${baseLinks.join(", ")}`);
        lines.push("");
    }

    // 9. Final annotation
    if (cls.isFinal) {
        lines.push(`This class is marked ${renderBadge("final")}.`);
        lines.push("");
    }

    // Trim trailing blank lines
    trimTrailingBlankLines(lines);

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Body section rendering
// ---------------------------------------------------------------------------

/**
 * Determine the section order for a class.
 * Uses sectionLabels from the IR to determine section headings and ordering.
 */
interface MethodSection {
    label: string;
    methods: CppFunctionIr[];
}

/**
 * Build a mapping from method path to section label.
 *
 * The IR's sectionLabels may use either:
 * 1. Method paths as keys (direct lookup works), or
 * 2. Doxygen refids as keys (positional correspondence with methods array).
 *
 * This function handles both cases by first trying direct path lookup,
 * then falling back to positional mapping when keys are refids.
 */
function buildMethodToLabelMap(cls: CppClassIr): Map<string, string> {
    const labelMap = new Map<string, string>();
    const labelKeys = Object.keys(cls.sectionLabels);

    if (labelKeys.length === 0) {
        return labelMap;
    }

    // Check if any key directly matches a method path
    const hasDirectPathMatch = cls.methods.some((m) => cls.sectionLabels[m.path] != null);

    if (hasDirectPathMatch) {
        // Keys are method paths -- direct lookup, keyed by method index
        const result = new Map<string, string>();
        for (let i = 0; i < cls.methods.length; i++) {
            const method = cls.methods[i];
            if (method == null) {
                continue;
            }
            const label = cls.sectionLabels[method.path];
            if (label != null) {
                result.set(String(i), label);
            }
        }
        return result;
    }

    // Keys are Doxygen refids -- use positional correspondence.
    // The sectionLabels entries correspond to methods in order.
    for (let i = 0; i < labelKeys.length && i < cls.methods.length; i++) {
        const key = labelKeys[i];
        if (key == null) {
            continue;
        }
        const label = cls.sectionLabels[key];
        if (label != null) {
            labelMap.set(String(i), label);
        }
    }

    return labelMap;
}

/**
 * Post-process sections to merge those that share the same method names and
 * whose labels share a common prefix (e.g., "Exclusive prefix sum operations"
 * and "Exclusive prefix sum operations (multiple data per thread)").
 *
 * When merged, the shorter/base label is used as the H2 section header,
 * and all overloads go into a single Tabs group.
 */
function mergeSiblingMethodSections(sections: MethodSection[]): MethodSection[] {
    const merged: MethodSection[] = [];

    for (let i = 0; i < sections.length; i++) {
        const current = sections[i];
        if (current == null) {
            continue;
        }

        // Check if this section can merge with subsequent sections
        // Collect all sections that share the same method name set and
        // whose labels start with the current label (or vice versa)
        const toMerge: MethodSection[] = [current];
        let baseLabel = current.label;

        // Get the set of method names in the current section
        const currentMethodNames = new Set(current.methods.map((m) => m.name));

        let j = i + 1;
        while (j < sections.length) {
            const next = sections[j];
            if (next == null) {
                break;
            }
            const nextMethodNames = new Set(next.methods.map((m) => m.name));

            // Check if method name sets overlap (same method names)
            const hasOverlap = [...currentMethodNames].some((n) => nextMethodNames.has(n));

            if (hasOverlap) {
                // Check if one label is a prefix of the other
                const shorter = baseLabel.length <= next.label.length ? baseLabel : next.label;
                const longer = baseLabel.length <= next.label.length ? next.label : baseLabel;

                if (longer.startsWith(shorter)) {
                    toMerge.push(next);
                    // Always use the shorter label as the base
                    baseLabel = shorter;
                    j++;
                    continue;
                }
            }
            break;
        }

        if (toMerge.length > 1) {
            // Merge all methods from matched sections into one
            const allMethods: CppFunctionIr[] = [];
            for (const section of toMerge) {
                allMethods.push(...section.methods);
            }
            merged.push({ label: baseLabel, methods: allMethods });
            i = j - 1; // skip merged sections
        } else {
            merged.push(current);
        }
    }

    return merged;
}

/**
 * Categorize methods into sections based on sectionLabels and method characteristics.
 *
 * The IR's sectionLabels maps function refids (or paths) to their section labels.
 * Methods with the same label are grouped together.
 */
function categorizeMethodSections(cls: CppClassIr): MethodSection[] {
    // Build index-based label map that handles both refid and path keys
    const labelMap = buildMethodToLabelMap(cls);
    const hasLabels = labelMap.size > 0;

    if (hasLabels) {
        // Use IR-provided section labels (resolved from refids or paths)
        const sections: MethodSection[] = [];
        const sectionMap = new Map<string, CppFunctionIr[]>();
        const sectionOrder: string[] = [];

        for (let i = 0; i < cls.methods.length; i++) {
            const method = cls.methods[i];
            if (method == null) {
                continue;
            }
            const label = labelMap.get(String(i)) ?? "Utility methods";
            if (!sectionMap.has(label)) {
                sectionMap.set(label, []);
                sectionOrder.push(label);
            }
            sectionMap.get(label)?.push(method);
        }

        for (const label of sectionOrder) {
            const methods = sectionMap.get(label);
            if (methods == null) {
                continue;
            }
            if (methods.length > 0) {
                sections.push({ label, methods });
            }
        }

        // Post-process: merge sibling sections that refer to the same methods
        // (e.g., "Exclusive prefix sum operations" + "... (multiple data per thread)")
        return mergeSiblingMethodSections(sections);
    }

    // Auto-categorize when sectionLabels is empty or keys don't match method paths
    const className = getShortName(cls.path);
    const constructors: CppFunctionIr[] = [];
    const destructors: CppFunctionIr[] = [];
    const assignmentOps: CppFunctionIr[] = [];
    const regularMethods: CppFunctionIr[] = [];

    for (const method of cls.methods) {
        const shortName = getShortName(method.name);
        if (shortName === className) {
            constructors.push(method);
        } else if (shortName === `~${className}`) {
            destructors.push(method);
        } else if (method.name === "operator=") {
            assignmentOps.push(method);
        } else {
            regularMethods.push(method);
        }
    }

    const sections: MethodSection[] = [];

    // Constructors (including destructors at the end)
    if (constructors.length > 0 || destructors.length > 0) {
        sections.push({
            label: "Constructors",
            methods: [...constructors, ...destructors]
        });
    }

    // Assignment operators
    if (assignmentOps.length > 0) {
        sections.push({
            label: "Assignment operators",
            methods: assignmentOps
        });
    }

    // Regular methods
    if (regularMethods.length > 0) {
        sections.push({
            label: "Methods",
            methods: regularMethods
        });
    }

    return sections;
}

/**
 * Render a section of methods (a group under an H2 heading).
 * Methods with the same name are grouped as overloads.
 * Different method names within the same section are separated by ---.
 */
function renderMethodSection(label: string, methods: CppFunctionIr[], cls: CppClassIr, ctx: RenderContext): string {
    const lines: string[] = [];
    lines.push(`## ${escapeMdxText(label)}`);
    lines.push("");

    const groups = groupFunctionsByName(methods);
    const groupEntries = Array.from(groups.entries());

    // Check for constructor section: identify constructors and destructors
    const className = getShortName(cls.path);
    const isConstructorSection = label.toLowerCase().includes("constructor");

    for (let i = 0; i < groupEntries.length; i++) {
        const entry = groupEntries[i];
        if (entry == null) {
            continue;
        }
        const [name, funcs] = entry;

        // Detect destructor
        if (name.startsWith("~")) {
            const first = funcs[0];
            if (funcs.length === 1 && first != null) {
                lines.push(renderDestructor(first, cls, ctx));
            } else {
                // Multiple destructor overloads (unusual but handle gracefully)
                for (const func of funcs) {
                    lines.push(renderDestructor(func, cls, ctx));
                }
            }
        } else if (funcs.length === 1 && funcs[0] != null) {
            lines.push(renderSingleMethod(funcs[0], cls, ctx));
        } else {
            lines.push(
                renderOverloadedMethod(funcs, cls, ctx, {
                    isConstructor: isConstructorSection && name === className
                })
            );
        }

        // No --- separators between methods within the same H2 section.
        // The --- separators only appear between H2 sections (handled in renderClassPage).
        if (i < groupEntries.length - 1) {
            lines.push("");
        }
    }

    return lines.join("\n");
}

/**
 * Render the static methods section.
 */
function renderStaticMethodsSection(cls: CppClassIr, ctx: RenderContext): string {
    if (cls.staticMethods.length === 0) {
        return "";
    }

    const lines: string[] = [];

    // Check if static methods have matching section labels
    const sectionMap = new Map<string, CppFunctionIr[]>();
    const sectionOrder: string[] = [];

    for (const method of cls.staticMethods) {
        const label = cls.sectionLabels[method.path] ?? "Static methods";
        if (!sectionMap.has(label)) {
            sectionMap.set(label, []);
            sectionOrder.push(label);
        }
        sectionMap.get(label)?.push(method);
    }

    for (const label of sectionOrder) {
        const methods = sectionMap.get(label);
        if (methods == null) {
            continue;
        }
        lines.push(renderMethodSection(label, methods, cls, ctx));
    }

    return lines.join("\n");
}

/**
 * Render the Types section (typedefs + enums).
 */
function renderTypesSection(cls: CppClassIr): string {
    if (cls.typedefs.length === 0 && cls.enums.length === 0) {
        return "";
    }

    const lines: string[] = [];
    lines.push("## Types");
    lines.push("");

    // Typedefs
    if (cls.typedefs.length > 0) {
        lines.push("### Typedefs");
        lines.push("");
        lines.push(renderTypedefTable(cls.typedefs));
    }

    // Enums
    if (cls.enums.length > 0) {
        if (cls.typedefs.length > 0) {
            lines.push("");
        }
        for (const enumIr of cls.enums) {
            lines.push(renderEnum(enumIr));
        }
    }

    return lines.join("\n");
}

/**
 * Render the Member Variables section.
 */
function renderMemberVariablesSection(cls: CppClassIr): string {
    if (cls.memberVariables.length === 0) {
        return "";
    }

    const lines: string[] = [];
    lines.push("## Member variables");
    lines.push("");
    lines.push(renderMemberVariableTable(cls.memberVariables, cls.path));

    return lines.join("\n");
}

/**
 * Render the Inner Classes section.
 */
function renderInnerClassesSection(cls: CppClassIr): string {
    if (cls.innerClasses.length === 0) {
        return "";
    }

    const lines: string[] = [];
    lines.push("## Inner classes");
    lines.push("");

    for (let i = 0; i < cls.innerClasses.length; i++) {
        const inner = cls.innerClasses[i];
        if (inner == null) {
            continue;
        }
        lines.push(renderInnerClass(inner, cls.path));
        if (i < cls.innerClasses.length - 1) {
            lines.push("");
        }
    }

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main class page renderer
// ---------------------------------------------------------------------------

/**
 * Render a full class/struct page as MDX.
 */
export function renderClassPage(cls: CppClassIr, meta: CompoundMeta): string {
    // Set current page path so self-referential links render as plain code
    setCurrentPagePath(cls.path);
    // Register class members for inner type link resolution
    registerClassMembers(cls);

    try {
        const ctx: RenderContext = { meta };
        const sections: string[] = [];

        // Frontmatter
        sections.push(renderClassFrontmatter(cls, meta));

        // Preamble
        const preamble = renderPreamble(cls, ctx);
        if (preamble) {
            sections.push("");
            sections.push(preamble);
        }

        // Body sections
        const bodySections: string[] = [];

        // Method sections (regular methods grouped by section label)
        const methodSections = categorizeMethodSections(cls);
        for (const section of methodSections) {
            bodySections.push(renderMethodSection(section.label, section.methods, cls, ctx));
        }

        // Static methods
        const staticSection = renderStaticMethodsSection(cls, ctx);
        if (staticSection) {
            bodySections.push(staticSection);
        }

        // Friend functions section is intentionally omitted.
        // The data is still available in the IR (cls.friendFunctions) if needed in the future.

        // Types
        const typesSection = renderTypesSection(cls);
        if (typesSection) {
            bodySections.push(typesSection);
        }

        // Member variables
        const memberVarsSection = renderMemberVariablesSection(cls);
        if (memberVarsSection) {
            bodySections.push(memberVarsSection);
        }

        // Inner classes
        const innerClassesSection = renderInnerClassesSection(cls);
        if (innerClassesSection) {
            bodySections.push(innerClassesSection);
        }

        // Join body sections with --- separators
        if (bodySections.length > 0) {
            sections.push("");
            sections.push("---");

            for (let i = 0; i < bodySections.length; i++) {
                sections.push("");
                const section = bodySections[i];
                if (section != null) {
                    sections.push(section);
                }
                if (i < bodySections.length - 1) {
                    sections.push("");
                    sections.push("---");
                }
            }
        }

        return sections.join("\n") + "\n";
    } finally {
        // Clear current page path after rendering
        setCurrentPagePath(undefined);
        clearClassMembers();
    }
}
