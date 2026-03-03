/**
 * Renders individual C++ methods and method groups to MDX.
 *
 * Handles:
 * - Single methods (no overloads) with H3 heading + badges + content
 * - Overloaded methods with Tabs component
 * - Common vs overload-specific badges
 * - Constructors (class name as heading)
 * - Destructors (### Destructor label + ### ~ClassName)
 * - Deleted overloads (= delete suffix in signature)
 * - Version annotations
 * - Returns, Throws, callouts (Warnings, Notes, postconditions, preconditions, deprecated)
 * - Examples within method tabs
 * - Tab title generation from overload characteristics
 */

import type {
    CppClassIr,
    CppDocstringIr,
    CppFunctionIr
} from "../../../src/types/CppLibraryDocsIr.js";
import {
    getFunctionQualifiers,
    getCommonQualifiers,
    getOverloadSpecificQualifiers,
    renderBadges
} from "./BadgeRenderer.js";
import { renderDescriptionBlocks, renderSegmentsTrimmed, extractVersionAnnotation, findVerbatimRstBlock, parseMethodVerbatimRst, renderSeeAlso } from "./DescriptionRenderer.js";
import type { ParsedMethodVerbatim } from "./DescriptionRenderer.js";
import { renderMethodTemplateParams, renderMethodParams } from "./ParamRenderer.js";
import { renderSignatureCodeBlock, renderBareCodeBlock, renderCodeBlock } from "./SignatureRenderer.js";
import type { RenderContext } from "../context.js";
import { getShortName, buildLinkPath } from "../context.js";

// ---------------------------------------------------------------------------
// Tab title generation
// ---------------------------------------------------------------------------

/**
 * Check whether a function is deleted, using both the IR field and signature heuristic.
 * The IR's isDeleted field is sometimes false even when the signature contains "=delete".
 */
export function isEffectivelyDeleted(func: CppFunctionIr): boolean {
    if (func.isDeleted) {
        return true;
    }
    // Check signature for =delete (the IR field is unreliable for some parsers)
    return /=\s*delete\s*$/.test(func.signature);
}

/**
 * Trim a summary string to a short noun phrase suitable for a tab title.
 * Strips leading "This method/function" boilerplate, trailing periods,
 * and if still too long, tries to extract a leading noun phrase.
 */
function trimToNounPhrase(summary: string, maxLen: number = 50): string | undefined {
    if (!summary) {
        return undefined;
    }
    // Strip leading boilerplate like "This method returns..." -> "Returns..."
    let trimmed = summary
        .replace(/^This (?:method|function|member function)\s+/i, "")
        .replace(/\.$/, "")
        .trim();
    // Capitalize first letter after stripping
    if (trimmed.length > 0) {
        trimmed = trimmed[0]!.toUpperCase() + trimmed.slice(1);
    }
    if (trimmed.length <= maxLen) {
        return trimmed;
    }
    // Try to extract a shorter noun phrase by taking text before first period
    // or comma that is NOT inside brackets (e.g., [first,last) should stay intact)
    const cutIdx = findTopLevelBreak(trimmed);
    if (cutIdx !== -1 && cutIdx <= maxLen) {
        const sub = trimmed.substring(0, cutIdx).trim();
        if (sub.length > 0 && sub.length <= maxLen) {
            return sub;
        }
    }
    return undefined;
}

/**
 * Find the index of the first top-level comma or period in a string,
 * skipping commas/periods inside brackets ([], (), <>).
 */
function findTopLevelBreak(str: string): number {
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
        const ch = str[i]!;
        if (ch === "[" || ch === "(" || ch === "<") {
            depth++;
        } else if (ch === "]" || ch === ")" || ch === ">") {
            depth--;
        } else if ((ch === "," || ch === ".") && depth === 0) {
            return i;
        }
    }
    return -1;
}

/**
 * Generate a tab title for a constructor overload.
 * Uses docstring summary if available, falls back to parameter-based heuristics.
 */
function generateConstructorTabTitle(func: CppFunctionIr, index: number): string {
    // Check for deleted constructor first
    if (isEffectivelyDeleted(func)) {
        if (func.parameters.length === 1) {
            const paramType = func.parameters[0]?.typeInfo?.display ?? "";
            if (paramType.includes("const") && paramType.includes("&")) {
                return "Copy (deleted)";
            }
            if (paramType.includes("&&")) {
                return "Move (deleted)";
            }
        }
        return `Deleted overload ${index + 1}`;
    }

    // Default constructor (no params)
    if (func.parameters.length === 0) {
        return "Default";
    }

    // Use summary if it's short enough (check BEFORE parameter heuristics
    // so descriptive summaries like "Device and priority" take precedence)
    if (func.docstring?.summary && func.docstring.summary.length > 0) {
        const summary = renderSegmentsTrimmed(func.docstring.summary);
        const title = trimToNounPhrase(summary, 50);
        if (title) {
            return title;
        }
    }

    // Parameter-based heuristics for single-parameter constructors
    if (func.parameters.length === 1) {
        const paramType = func.parameters[0]?.typeInfo?.display ?? "";

        // Move constructor: T&& (non-const rvalue ref)
        if (paramType.includes("&&") && !paramType.includes("const")) {
            return "Move";
        }
        // Copy constructor: const T&
        if (paramType.includes("const") && paramType.includes("&")) {
            return "Copy";
        }
        // From nullptr
        if (paramType.includes("nullptr_t")) {
            return "From nullptr";
        }
        // From native handle types (cudaStream_t, etc.)
        if (paramType.includes("cudaStream_t") || paramType.includes("cudaEvent_t") ||
            (paramType.includes("_t") && !paramType.includes("init_t"))) {
            return "From native handle";
        }
        // no_init_t
        if (paramType.includes("no_init_t") || paramType.includes("noinit")) {
            return "No-init";
        }
        // initializer_list
        if (paramType.includes("initializer_list")) {
            return "From initializer_list";
        }
    }

    // Multi-parameter heuristics
    if (func.parameters.length >= 1) {
        const allTypes = func.parameters.map(p => p.typeInfo?.display ?? "").join(", ");

        // TempStorage pattern: any param named temp_storage or type containing TempStorage
        if (allTypes.includes("TempStorage") ||
            func.parameters.some(p => p.name === "temp_storage")) {
            return "With TempStorage";
        }

        // Iterator range: two iterator params
        const hasIteratorPair = func.parameters.length >= 2 &&
            (allTypes.includes("InputIterator") || allTypes.includes("Iterator") ||
             allTypes.includes("ForwardIterator") || allTypes.includes("InputIt"));
        if (hasIteratorPair) {
            return "From iterator range";
        }

        // initializer_list in any param
        if (allTypes.includes("initializer_list")) {
            return "From initializer_list";
        }

        // Explicit pointer param (OtherElement* or T*)
        if (func.parameters.length === 1) {
            const paramType = func.parameters[0]?.typeInfo?.display ?? "";
            if (paramType.includes("*") && !paramType.includes("(")) {
                return "From raw pointer";
            }
        }

        // From other pointer type
        if (allTypes.includes("OtherPointer") || allTypes.includes("Pointer")) {
            return "From other pointer";
        }
    }

    // Fall back to numbered title
    return `Overload ${index + 1}`;
}

/**
 * Detect whether a function has array-syntax parameters (ITEMS_PER_THREAD pattern).
 * This indicates a "multiple items per thread" overload.
 *
 * Detection checks:
 * 1. Parameter arraySuffix field containing ITEMS_PER_THREAD
 * 2. Parameter typeInfo display containing array syntax
 * 3. Template parameter named ITEMS_PER_THREAD
 */
function hasArrayParams(func: CppFunctionIr): boolean {
    return func.parameters.some(p => {
        // Check arraySuffix field (most reliable)
        if (p.arraySuffix && p.arraySuffix.includes("ITEMS_PER_THREAD")) {
            return true;
        }
        const typeDisplay = p.typeInfo?.display ?? "";
        return typeDisplay.includes("[ITEMS_PER_THREAD]") ||
            /\(\s*&\s*\)\s*\[/.test(typeDisplay);
    }) || func.templateParams.some(tp => tp.name === "ITEMS_PER_THREAD");
}

/**
 * Detect whether a function has a block_aggregate output parameter.
 */
function hasAggregateParam(func: CppFunctionIr): boolean {
    return func.parameters.some(p => p.name === "block_aggregate");
}

/**
 * Detect whether a function has a prefix callback template parameter.
 */
function hasPrefixCallbackParam(func: CppFunctionIr): boolean {
    return func.templateParams.some(tp => {
        const name = tp.name ?? "";
        const type = tp.type ?? "";
        return name.includes("PrefixCallbackOp") ||
            name.includes("BlockPrefixCallbackOp") ||
            type.includes("PrefixCallbackOp") ||
            type.includes("BlockPrefixCallbackOp");
    }) || func.parameters.some(p => {
        const type = p.typeInfo?.display ?? "";
        return type.includes("PrefixCallbackOp") || type.includes("BlockPrefixCallbackOp");
    });
}

/**
 * Detect whether a function has a num_valid / num_items parameter (partial tile).
 */
function hasPartialTileParam(func: CppFunctionIr): boolean {
    return func.parameters.some(p =>
        p.name === "num_valid" || p.name === "num_items"
    );
}

/**
 * Detect whether a function has an initial_value parameter.
 */
function hasInitialValueParam(func: CppFunctionIr): boolean {
    return func.parameters.some(p =>
        p.name === "initial_value" || p.name === "init_value"
    );
}

/**
 * Generate a semantic tab title for a method overload based on its
 * parameters and template parameters relative to others in the group.
 *
 * Title patterns (from golden pages):
 * - "Single item" — base overload with single T input
 * - "Multiple items per thread" — has ITEMS_PER_THREAD array params
 * - "With aggregate" — single item + block_aggregate param
 * - "With prefix callback" — single item + BlockPrefixCallbackOp template param
 * - "Multiple items with aggregate" — array params + block_aggregate
 * - "Multiple items with prefix callback" — array params + BlockPrefixCallbackOp
 * - "Multiple items with initial value" — array params + initial_value
 * - "Multiple items with initial value and aggregate" — array + initial_value + aggregate
 * - "Partial tile" — has num_valid parameter
 */
function generateMethodTabTitle(func: CppFunctionIr, index: number): string {
    // Check for deleted
    if (isEffectivelyDeleted(func)) {
        return `Deleted overload`;
    }

    const isMultiItem = hasArrayParams(func);
    const hasAggregate = hasAggregateParam(func);
    const hasPrefixCb = hasPrefixCallbackParam(func);
    const isPartialTile = hasPartialTileParam(func);
    const hasInitVal = hasInitialValueParam(func);

    // Build semantic title from detected traits.
    // For multi-item overloads, initial_value/aggregate/prefix callback are differentiators.
    // For single-item overloads, only aggregate and prefix callback are differentiators
    // (initial_value is often shared by all single-item overloads, e.g., ExclusiveScan).
    if (isMultiItem) {
        const traits: string[] = [];
        if (hasInitVal) {
            traits.push("initial value");
        }
        if (hasAggregate) {
            traits.push("aggregate");
        }
        if (hasPrefixCb) {
            traits.push("prefix callback");
        }
        if (traits.length > 0) {
            return `Multiple items with ${traits.join(" and ")}`;
        }
        return "Multiple items per thread";
    }

    if (isPartialTile) {
        return "Partial tile";
    }

    if (hasAggregate && hasPrefixCb) {
        return "With aggregate and prefix callback";
    }
    if (hasPrefixCb) {
        return "With prefix callback";
    }
    if (hasAggregate) {
        return "With aggregate";
    }

    // If this overload has no special distinguishing traits (aggregate, prefix callback, etc.)
    // it's the "base" single-item overload
    // Check for single-item pattern: has at least one simple input param that's not an array
    const hasSimpleInput = func.parameters.some(p => {
        const typeDisplay = p.typeInfo?.display ?? "";
        return (p.name === "input" || p.name === "data") &&
            !typeDisplay.includes("[") && !typeDisplay.includes("(&)") &&
            !(p.arraySuffix && p.arraySuffix.length > 0);
    });
    if (hasSimpleInput) {
        return "Single item";
    }

    // Const/Mutable differentiation
    if (func.isConst) {
        return "Const";
    }

    // Use summary if short enough (with noun phrase extraction)
    if (func.docstring?.summary && func.docstring.summary.length > 0) {
        const summary = renderSegmentsTrimmed(func.docstring.summary);
        const title = trimToNounPhrase(summary, 50);
        if (title) {
            return title;
        }
    }

    return `Overload ${index + 1}`;
}

// ---------------------------------------------------------------------------
// Method content rendering (inside a tab or standalone)
// ---------------------------------------------------------------------------

/**
 * Render the content of a single method/overload.
 * This is the body that appears inside a Tab or directly under an H3.
 *
 * Content order:
 * 1. Overload-specific badges (if in a tab context)
 * 2. Description (summary + description blocks)
 * 3. Signature CodeBlock
 * 4. Version annotation (italic)
 * 5. Callouts (deprecated, warnings, notes, postconditions, preconditions)
 * 6. Template parameters
 * 7. Parameters
 * 8. Returns
 * 9. Throws
 * 10. Examples
 */
export function renderMethodContent(
    func: CppFunctionIr,
    ownerClass: CppClassIr | undefined,
    ctx: RenderContext,
    options: {
        showOverloadBadges?: string[];
        isTabContext?: boolean;
    } = {}
): string {
    const lines: string[] = [];
    const docstring = func.docstring;

    // 1. Overload-specific badges (inside tab)
    if (options.showOverloadBadges && options.showOverloadBadges.length > 0) {
        lines.push(renderBadges(options.showOverloadBadges));
        lines.push("");
    }

    // Check if description contains a verbatim RST block for structured extraction
    let parsedMethodRst: ParsedMethodVerbatim | undefined = undefined;
    if (docstring?.description) {
        const verbatimContent = findVerbatimRstBlock(docstring.description);
        if (verbatimContent) {
            parsedMethodRst = parseMethodVerbatimRst(verbatimContent);
        }
    }

    // 2. Description
    const descParts: string[] = [];
    if (docstring) {
        // Summary from structured docstring fields
        if (docstring.summary.length > 0) {
            const summary = renderSegmentsTrimmed(docstring.summary);
            if (summary) {
                descParts.push(summary);
            }
        }
        // Description: use structured RST extraction if available, else flat rendering
        if (parsedMethodRst) {
            if (parsedMethodRst.descriptionText) {
                descParts.push(parsedMethodRst.descriptionText);
            }
        } else if (docstring.description.length > 0) {
            const desc = renderDescriptionBlocks(docstring.description);
            if (desc) {
                descParts.push(desc);
            }
        }
    }
    if (descParts.length > 0) {
        lines.push(descParts.join("\n\n"));
        lines.push("");
    }

    // 3. Signature CodeBlock
    lines.push(renderSignatureCodeBlock(func, ownerClass, ctx));
    lines.push("");

    // 4. Version annotation (from sinceVersion field or verbatim RST blocks)
    if (docstring?.sinceVersion) {
        lines.push(`*${docstring.sinceVersion}*`);
        lines.push("");
    } else if (docstring?.description) {
        // Extract version annotation from verbatim RST blocks in description
        const versionAnnotation = extractVersionAnnotation(docstring.description);
        if (versionAnnotation) {
            lines.push(versionAnnotation);
            lines.push("");
        }
    }

    // 5. Callouts
    // Deprecated
    if (docstring?.deprecated) {
        const depText = renderSegmentsTrimmed(docstring.deprecated);
        if (depText) {
            lines.push(`<Error title="Deprecated">`);
            lines.push(depText);
            lines.push(`</Error>`);
            lines.push("");
        }
    }

    // Notes: use verbatim RST extraction when available, else structured docstring fields
    // (Notes render before Warnings per golden page convention)
    if (parsedMethodRst) {
        if (parsedMethodRst.noteItems.length > 0) {
            lines.push("<Note>");
            lines.push(parsedMethodRst.noteItems.join("\n"));
            lines.push("</Note>");
            lines.push("");
        }
    } else if (docstring?.notes) {
        for (const note of docstring.notes) {
            const text = renderSegmentsTrimmed(note);
            if (text) {
                lines.push("<Note>");
                lines.push(text);
                lines.push("</Note>");
                lines.push("");
            }
        }
    }

    // Warnings: use verbatim RST extraction when available, else structured docstring fields
    if (parsedMethodRst) {
        for (const warningText of parsedMethodRst.warningItems) {
            lines.push("<Warning>");
            lines.push(warningText);
            lines.push("</Warning>");
            lines.push("");
        }
    } else if (docstring?.warnings) {
        for (const warning of docstring.warnings) {
            const text = renderSegmentsTrimmed(warning);
            if (text) {
                lines.push("<Warning>");
                lines.push(text);
                lines.push("</Warning>");
                lines.push("");
            }
        }
    }

    // Postconditions
    if (docstring?.postconditions) {
        for (const pc of docstring.postconditions) {
            const text = renderSegmentsTrimmed(pc);
            if (text) {
                lines.push(`<Info title="Postconditions">`);
                lines.push(text);
                lines.push(`</Info>`);
                lines.push("");
            }
        }
    }

    // Preconditions
    if (docstring?.preconditions) {
        for (const pc of docstring.preconditions) {
            const text = renderSegmentsTrimmed(pc);
            if (text) {
                lines.push(`<Info title="Preconditions">`);
                lines.push(text);
                lines.push(`</Info>`);
                lines.push("");
            }
        }
    }

    // 6. Returns (before template params and params per golden page pattern)
    if (docstring?.returns) {
        const returnsText = renderSegmentsTrimmed(docstring.returns);
        if (returnsText) {
            lines.push(`**Returns:** ${returnsText}`);
            lines.push("");
        }
    }

    // 7. Template parameters
    const tplParams = renderMethodTemplateParams(func, docstring);
    if (tplParams) {
        lines.push(tplParams);
        lines.push("");
    }

    // 8. Parameters
    const params = renderMethodParams(func, docstring);
    if (params) {
        lines.push(params);
        lines.push("");
    }

    // 9. Throws / Raises
    if (docstring?.raises && docstring.raises.length > 0) {
        for (const r of docstring.raises) {
            const desc = renderSegmentsTrimmed(r.description);
            if (desc) {
                lines.push(`**Throws:** ${r.exception ? `\`${r.exception}\` ` : ""}${desc}`);
                lines.push("");
            }
        }
    }

    // 10. Examples: from structured docstring fields + verbatim RST extraction
    if (docstring?.examples && docstring.examples.length > 0) {
        for (const example of docstring.examples) {
            lines.push("**Example**");
            lines.push("");
            // If the example has a description-like introductory text in surrounding docstring,
            // it would be part of the description blocks already rendered above.
            const lang = example.language || "cpp";
            lines.push(renderBareCodeBlock(example.code, lang));
            lines.push("");
        }
    } else if (parsedMethodRst?.exampleCode) {
        // Example extracted from verbatim RST block
        lines.push("**Example**");
        lines.push("");
        if (parsedMethodRst.exampleDescription) {
            lines.push(parsedMethodRst.exampleDescription);
            lines.push("");
        }
        const lang = parsedMethodRst.exampleLanguage || "cpp";
        lines.push(renderBareCodeBlock(parsedMethodRst.exampleCode, lang));
        lines.push("");
    }

    // 11. See also (multi-line format per golden pages)
    if (docstring?.seeAlso && docstring.seeAlso.length > 0) {
        const seeAlsoBlock = renderSeeAlso(docstring.seeAlso);
        if (seeAlsoBlock) {
            lines.push(seeAlsoBlock);
        }
    }

    // Trim trailing blank lines
    while (lines.length > 0 && lines[lines.length - 1] === "") {
        lines.pop();
    }

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Single method rendering (no overloads)
// ---------------------------------------------------------------------------

/**
 * Render a single method (non-overloaded) as an H3 section.
 */
export function renderSingleMethod(
    func: CppFunctionIr,
    ownerClass: CppClassIr | undefined,
    ctx: RenderContext
): string {
    const lines: string[] = [];
    const qualifiers = getFunctionQualifiers(func);
    const badgeStr = qualifiers.length > 0 ? ` ${renderBadges(qualifiers)}` : "";
    const displayName = func.name;

    lines.push(`### ${displayName}${badgeStr}`);
    lines.push("");

    const content = renderMethodContent(func, ownerClass, ctx);
    lines.push(content);

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Overloaded method rendering (with Tabs)
// ---------------------------------------------------------------------------

/**
 * Render a group of overloaded methods under a single H3 heading with Tabs.
 *
 * BUG 11 fix: When multiple overloads are deleted, they are combined into
 * a single "Deleted overloads" tab with all signatures in one CodeBlock.
 */
export function renderOverloadedMethod(
    funcs: CppFunctionIr[],
    ownerClass: CppClassIr | undefined,
    ctx: RenderContext,
    options: {
        isConstructor?: boolean;
        generateTabTitle?: (func: CppFunctionIr, index: number) => string;
    } = {}
): string {
    if (funcs.length === 0) {
        return "";
    }
    if (funcs.length === 1) {
        return renderSingleMethod(funcs[0]!, ownerClass, ctx);
    }

    // BUG 11: Separate deleted and non-deleted overloads
    const nonDeletedFuncs: CppFunctionIr[] = [];
    const deletedFuncs: CppFunctionIr[] = [];
    for (const func of funcs) {
        if (isEffectivelyDeleted(func)) {
            deletedFuncs.push(func);
        } else {
            nonDeletedFuncs.push(func);
        }
    }

    // If only one non-deleted overload and no deleted ones, render as single method
    if (nonDeletedFuncs.length === 1 && deletedFuncs.length === 0) {
        return renderSingleMethod(nonDeletedFuncs[0]!, ownerClass, ctx);
    }

    const lines: string[] = [];
    const displayName = funcs[0]!.name;

    // Common qualifiers go on the H3 heading (computed from all funcs, including deleted)
    const commonQuals = getCommonQualifiers(funcs);
    const badgeStr = commonQuals.length > 0 ? ` ${renderBadges(commonQuals)}` : "";

    lines.push(`### ${displayName}${badgeStr}`);
    lines.push("");
    lines.push("<Tabs>");

    const titleGenerator = options.generateTabTitle ??
        (options.isConstructor ? generateConstructorTabTitle : generateMethodTabTitle);

    // Render non-deleted overloads as individual tabs
    for (let i = 0; i < nonDeletedFuncs.length; i++) {
        const func = nonDeletedFuncs[i]!;
        // Use the original index from the full funcs array for title generation
        const originalIndex = funcs.indexOf(func);
        const tabTitle = titleGenerator(func, originalIndex);
        const overloadBadges = getOverloadSpecificQualifiers(func, commonQuals);

        lines.push(`<Tab title="${tabTitle}">`);
        lines.push("");

        const content = renderMethodContent(func, ownerClass, ctx, {
            showOverloadBadges: overloadBadges,
            isTabContext: true
        });
        lines.push(content);
        lines.push("");

        lines.push("</Tab>");
    }

    // BUG 11: Combine deleted overloads into a single "Deleted overloads" tab
    if (deletedFuncs.length > 1) {
        lines.push(`<Tab title="Deleted overloads">`);
        lines.push("");
        lines.push("The following overloads are deleted to prevent misuse:");
        lines.push("");

        // Build combined signature CodeBlock
        const links = ownerClass
            ? { [getShortName(ownerClass.path)]: buildLinkPath(ownerClass.path) }
            : {};
        const signatures = deletedFuncs
            .map(f => {
                // Use the raw signature, strip =delete, then add normalized = delete;
                const rawSig = f.signature.replace(/\s*=\s*delete\s*$/, "").trim();
                return `${rawSig} = delete;`;
            })
            .join("\n");

        lines.push(renderCodeBlock(signatures, links));
        lines.push("");
        lines.push("</Tab>");
    } else if (deletedFuncs.length === 1) {
        // Single deleted overload: render as a regular tab
        const func = deletedFuncs[0]!;
        const originalIndex = funcs.indexOf(func);
        const tabTitle = titleGenerator(func, originalIndex);
        const overloadBadges = getOverloadSpecificQualifiers(func, commonQuals);

        lines.push(`<Tab title="${tabTitle}">`);
        lines.push("");

        const content = renderMethodContent(func, ownerClass, ctx, {
            showOverloadBadges: overloadBadges,
            isTabContext: true
        });
        lines.push(content);
        lines.push("");

        lines.push("</Tab>");
    }

    lines.push("</Tabs>");

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Destructor rendering
// ---------------------------------------------------------------------------

/**
 * Render a destructor.
 * Pattern: ### Destructor\n\n### ~ClassName <badges>
 */
export function renderDestructor(
    func: CppFunctionIr,
    ownerClass: CppClassIr,
    ctx: RenderContext
): string {
    const lines: string[] = [];
    const className = getShortName(ownerClass.path);
    const qualifiers = getFunctionQualifiers(func);
    const badgeStr = qualifiers.length > 0 ? ` ${renderBadges(qualifiers)}` : "";

    lines.push("### Destructor");
    lines.push("");
    lines.push(`### ~${className}${badgeStr}`);
    lines.push("");

    const content = renderMethodContent(func, ownerClass, ctx);
    lines.push(content);

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Method group by name
// ---------------------------------------------------------------------------

/**
 * Group functions by their name for overload detection.
 */
export function groupFunctionsByName(funcs: CppFunctionIr[]): Map<string, CppFunctionIr[]> {
    const groups = new Map<string, CppFunctionIr[]>();
    for (const func of funcs) {
        const existing = groups.get(func.name);
        if (existing) {
            existing.push(func);
        } else {
            groups.set(func.name, [func]);
        }
    }
    return groups;
}
