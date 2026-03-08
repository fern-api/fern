/**
 * Renders C++ function/method signatures as CodeBlock components with links.
 *
 * Handles:
 * - Template prefixes
 * - Multi-line parameter formatting
 * - Const/noexcept/override qualifiers
 * - Links prop construction
 * - Deleted functions (= delete)
 * - Default arguments
 */

import type { CppClassIr, CppFunctionIr, CppTypeInfo } from "../../../src/types/CppLibraryDocsIr.js";
import { buildLinkPath, getShortName, type RenderContext, stripTemplateArgs } from "../context.js";
import { isTypeRef, resolveCompoundRef } from "./DescriptionRenderer.js";
import { isSfinaeParam } from "./ParamRenderer.js";
import { formatTemplateParam } from "./shared.js";

// ---------------------------------------------------------------------------
// Angle bracket spacing normalization
// ---------------------------------------------------------------------------

/**
 * Remove spaces immediately after `<` and before `>` in C++ template argument lists.
 *
 * Handles nested templates (e.g., `vector< pair< int, int > >` -> `vector<pair<int, int>>`).
 * Does NOT affect `<<` or `>>` shift operators.
 *
 * Strategy: walk the string character by character, tracking template angle bracket depth.
 * This avoids regex pitfalls with nested closing brackets `> >` becoming `>>`.
 */
export function normalizeAngleBracketSpacing(input: string): string {
    const chars = Array.from(input);
    const result: string[] = [];
    let depth = 0;

    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i] ?? "";
        const next = chars[i + 1];

        // Detect `<<` shift operator -- not a template bracket
        if (ch === "<" && next === "<") {
            result.push(ch);
            result.push(next);
            i++; // skip next
            continue;
        }

        // Detect `>>` shift operator (only when NOT inside template nesting)
        // If depth >= 2, `>>` is actually two closing template brackets
        if (ch === ">" && next === ">" && depth < 2) {
            result.push(ch);
            result.push(next);
            i++; // skip next
            continue;
        }

        if (ch === "<") {
            depth++;
            result.push(ch);
            // Skip spaces immediately after `<`
            while (i + 1 < chars.length && chars[i + 1] === " ") {
                i++;
            }
            continue;
        }

        if (ch === ">" && depth > 0) {
            // Remove trailing spaces before this `>`
            while (result.length > 0 && result[result.length - 1] === " ") {
                result.pop();
            }
            depth--;
            result.push(ch);
            continue;
        }

        result.push(ch);
    }

    return result.join("");
}

// ---------------------------------------------------------------------------
// Default value spacing normalization
// ---------------------------------------------------------------------------

/**
 * Normalize spacing around `=` in default parameter values inside a parameter list.
 *
 * Ensures `__priority=default_priority` becomes `__priority = default_priority`.
 * Does NOT affect `==`, `!=`, `<=`, `>=` operators.
 *
 * This is applied only to the parameter list string (between parentheses),
 * so `= delete` and `= default` suffixes (which appear after the closing paren)
 * are not affected.
 */
function normalizeDefaultValueSpacing(paramsStr: string): string {
    // Replace `=` that is a default value assignment (not ==, !=, <=, >=)
    // with properly spaced ` = `.
    // Pattern: a `=` that is:
    //   - NOT preceded by `!`, `<`, `>`, `=`
    //   - NOT followed by `=`
    return paramsStr.replace(/(?<![!<>=])=(?!=)/g, (match, offset: number) => {
        // Check if already properly spaced
        const before = paramsStr[offset - 1];
        const after = paramsStr[offset + 1];
        const needsSpaceBefore = before !== " ";
        const needsSpaceAfter = after !== " ";
        return `${needsSpaceBefore ? " " : ""}=${needsSpaceAfter ? " " : ""}`;
    });
}

// ---------------------------------------------------------------------------
// Links extraction
// ---------------------------------------------------------------------------

/**
 * Extract link targets from a type info's parts array.
 * Only compound refs (classes/structs) produce links.
 *
 * Inner class resolution is handled by `resolveCompoundRef` via the
 * module-level `nameToPathMap` populated by `registerClassMembers`.
 */
function extractLinksFromTypeInfo(typeInfo: CppTypeInfo | undefined): Map<string, string> {
    const links = new Map<string, string>();
    if (!typeInfo) {
        return links;
    }
    for (const part of typeInfo.parts) {
        if (isTypeRef(part) && part.kindref === "compound") {
            const shortName = getShortName(part.text);
            const qualifiedName = resolveCompoundRef(part.text, part.refid);
            const linkPath = buildLinkPath(qualifiedName);
            if (linkPath) {
                links.set(shortName, linkPath);
            }
        }
    }
    return links;
}

/**
 * Build the links prop object for a function's CodeBlock.
 * Includes: owning class, parameter types, return type.
 */
export function buildFunctionLinks(
    func: CppFunctionIr,
    ownerClass: CppClassIr | undefined,
    ctx: RenderContext
): Record<string, string> {
    const links: Record<string, string> = {};

    // Add the owning class link
    if (ownerClass) {
        const shortName = getShortName(ownerClass.path);
        const ownerLinkPath = buildLinkPath(ownerClass.path);
        if (ownerLinkPath) {
            links[shortName] = ownerLinkPath;
        }
    }

    // Extract links from parameter types
    for (const param of func.parameters) {
        const paramLinks = extractLinksFromTypeInfo(param.typeInfo);
        for (const [key, value] of paramLinks) {
            if (!links[key]) {
                links[key] = value;
            }
        }
    }

    // Extract links from return type
    const returnLinks = extractLinksFromTypeInfo(func.returnType);
    for (const [key, value] of returnLinks) {
        if (!links[key]) {
            links[key] = value;
        }
    }

    return links;
}

/**
 * Build the links prop for an inherited method's CodeBlock.
 * Includes both the current class and the declaring (base) class.
 *
 * For base class links, use the short class name (without template args) as
 * the link key, and strip template args from the URL path. For example,
 * "iterator_adaptor": "/library/api/thrust::iterator_adaptor" (not the full
 * templated form).
 */
export function buildInheritedMethodLinks(
    func: CppFunctionIr,
    ownerClass: CppClassIr,
    ctx: RenderContext
): Record<string, string> {
    const links = buildFunctionLinks(func, ownerClass, ctx);

    // Only add base class links for methods that are actually inherited
    // (their path doesn't start with the owner class path)
    const isInherited = !func.path.startsWith(ownerClass.path + "::");

    if (isInherited) {
        for (const base of ownerClass.baseClasses) {
            // Use short base class name (without template args) as key
            const baseName = stripTemplateArgs(base.name);
            const shortBaseName = getShortName(baseName);
            if (!links[shortBaseName]) {
                // URL also uses qualified name without template args
                const baseLinkPath = buildLinkPath(baseName);
                if (baseLinkPath) {
                    links[shortBaseName] = baseLinkPath;
                }
            }
        }
    }

    return links;
}

// ---------------------------------------------------------------------------
// Signature formatting
// ---------------------------------------------------------------------------

/**
 * Render a function signature as a CodeBlock MDX component.
 *
 * Uses the raw `signature` field from the IR which contains the
 * fully-qualified, pre-formatted signature string.
 */
export function renderSignatureCodeBlock(
    func: CppFunctionIr,
    ownerClass: CppClassIr | undefined,
    ctx: RenderContext
): string {
    const links = ownerClass
        ? buildInheritedMethodLinks(func, ownerClass, ctx)
        : buildFunctionLinks(func, undefined, ctx);

    const signature = formatSignature(func, ownerClass);
    return renderCodeBlock(signature, links);
}

/**
 * Format a function's signature from its IR fields.
 * The IR provides a raw `signature` string, but we need to reformat it
 * for multi-line display with proper template prefixes and indentation.
 *
 * When ownerClass is provided and the method is inherited (signature contains
 * a base class qualifier), the base class qualifier is replaced with the
 * derived class qualifier.
 */
export function formatSignature(func: CppFunctionIr, ownerClass?: CppClassIr): string {
    const parts: string[] = [];

    // Template prefix (suppressed when all params are SFINAE / enable_if)
    if (func.templateParams.length > 0) {
        const templateLine = formatTemplateLine(func);
        if (templateLine) {
            parts.push(templateLine);
        }
    }

    // Build the main signature from the IR's raw signature field
    // The raw signature already includes return type, qualified name, params, and qualifiers
    const formattedSig = reformatRawSignature(func, ownerClass);
    parts.push(formattedSig);

    return parts.join("\n");
}

/**
 * Format the template<...> prefix line from template params.
 */
function formatTemplateLine(func: CppFunctionIr): string {
    // Filter out SFINAE / enable_if template params (they are implementation details)
    const renderableTemplateParams = func.templateParams.filter((tp) => !isSfinaeParam(tp));

    // If all template params were SFINAE, suppress the template line entirely
    if (renderableTemplateParams.length === 0) {
        return "";
    }

    const params = renderableTemplateParams.map(formatTemplateParam);

    // Check if we need multi-line formatting
    const joined = params.join(", ");
    if (joined.length > 80) {
        return `template <${params.join(",\n          ")}>`;
    }

    return `template <${joined}>`;
}

/**
 * Reformat the raw signature from the IR into a properly indented multi-line format.
 *
 * The IR signature field has the general shape:
 *   ReturnType Namespace::Class::Method(ParamType1 param1, ParamType2 param2) const
 *
 * We parse this and reformat with one parameter per line when there are multiple params.
 *
 * When ownerClass is provided and the method path indicates it's inherited from a base
 * class, the base class qualifier in the signature is replaced with the derived class.
 */
function reformatRawSignature(func: CppFunctionIr, ownerClass?: CppClassIr): string {
    // Normalize angle bracket spacing in the raw signature
    let sig = normalizeAngleBracketSpacing(func.signature);

    // If this method is inherited (its path references a base class),
    // replace the base class qualifier with the derived class qualifier.
    if (ownerClass) {
        const ownerPath = ownerClass.path; // e.g. "cuda::stream"
        // Check if the method path is under a base class, not the owner
        // e.g. func.path = "cuda::stream_ref::get" but ownerPath = "cuda::stream"
        if (!func.path.startsWith(ownerPath + "::")) {
            // The method is inherited. Find which base class it belongs to.
            for (const base of ownerClass.baseClasses) {
                const basePath = base.name; // e.g. "cuda::stream_ref"
                if (func.path.startsWith(basePath + "::")) {
                    // Replace the base class qualifier in the signature with the derived class
                    sig = sig.replace(basePath + "::", ownerPath + "::");
                    break;
                }
            }
        }
    }

    // Find the opening paren for the parameter list.
    // Special case: operator() -- the first "()" is part of the operator name.
    const openParen = findParamListOpenParen(sig);
    if (openParen === -1) {
        return sig;
    }

    // Find the matching closing paren
    const closeParen = findMatchingParen(sig, openParen);
    if (closeParen === -1) {
        return sig;
    }

    const prefix = sig.substring(0, openParen);
    // Normalize default value spacing in parameters (add spaces around `=`)
    const paramsStr = normalizeDefaultValueSpacing(sig.substring(openParen + 1, closeParen));

    // Detect =delete / =default suffixes and strip them from the working signature
    const detected = detectDeletedOrDefaulted(sig, func.isDeleted);
    sig = detected.strippedSig;

    // Build the const/noexcept suffix from IR fields (more reliable than parsing)
    const quals = buildQualifierSuffix(func);

    // Combine suffixes (mutually exclusive: a function is either deleted, defaulted, or neither)
    const specialSuffix = detected.specialSuffix;

    if (!paramsStr.trim()) {
        // No parameters
        return `${prefix}()${quals}${specialSuffix}`;
    }

    // Split parameters (respect template angle brackets and nested parens)
    const params = splitParams(paramsStr);

    // One or more parameters: one per line, indented with 4 spaces
    const formattedParams = params.map((p, i) => {
        let trimmed = p.trim();
        // Insert space before (& or (* when preceded by a non-space character.
        // e.g., "T(&inputs)" -> "T (&inputs)", "T(*ptr)" -> "T (*ptr)"
        trimmed = trimmed.replace(/(\S)\(([&*])/g, "$1 ($2");
        const comma = i < params.length - 1 ? "," : "";
        return `    ${trimmed}${comma}`;
    });

    return [`${prefix}(`, ...formattedParams, `)${quals}${specialSuffix}`].join("\n");
}

/**
 * Find the opening paren of the parameter list in a signature string.
 * Handles the special case of `operator()` where the first `()` is part
 * of the operator name, not the parameter list.
 *
 * Returns -1 if no parameter list paren is found.
 */
function findParamListOpenParen(sig: string): number {
    let openParen = sig.indexOf("(");
    if (openParen === -1) {
        return -1;
    }

    // Check if this `(` is part of `operator()`
    const operatorCallIdx = sig.indexOf("operator()");
    if (operatorCallIdx !== -1 && openParen === operatorCallIdx + "operator".length) {
        // The first `(` is part of `operator()` -- skip past the `operator()` token
        // to find the real parameter list opening paren
        const afterOperatorCall = operatorCallIdx + "operator()".length;
        const realOpenParen = sig.indexOf("(", afterOperatorCall);
        if (realOpenParen !== -1) {
            return realOpenParen;
        }
        // No actual parameter list found after operator()
        return -1;
    }

    return openParen;
}

/**
 * Detect `= delete` and `= default` suffixes in a signature string.
 * Returns the special suffix to append and the signature with those suffixes stripped.
 *
 * The IR's isDeleted field is unreliable (often false even when signature has =delete),
 * so we check both the IR field and the raw signature string.
 */
function detectDeletedOrDefaulted(
    sig: string,
    isDeletedFromIr: boolean
): {
    specialSuffix: string;
    strippedSig: string;
} {
    const sigHasDelete = /=\s*delete\s*$/.test(sig);
    const deleteSuffix = isDeletedFromIr || sigHasDelete ? " = delete" : "";

    const sigHasDefault = /=\s*default\s*$/.test(sig);
    const defaultSuffix = sigHasDefault ? " = default" : "";

    let strippedSig = sig;
    if (sigHasDelete) {
        strippedSig = strippedSig.replace(/\s*=\s*delete\s*$/, "");
    }
    if (sigHasDefault) {
        strippedSig = strippedSig.replace(/\s*=\s*default\s*$/, "");
    }

    return {
        specialSuffix: deleteSuffix || defaultSuffix,
        strippedSig
    };
}

/**
 * Build qualifier suffix from function IR fields.
 */
function buildQualifierSuffix(func: CppFunctionIr): string {
    const parts: string[] = [];
    if (func.isConst) {
        parts.push("const");
    }
    if (func.isVolatile) {
        parts.push("volatile");
    }
    if (func.refQualifier === "lvalue") {
        parts.push("&");
    } else if (func.refQualifier === "rvalue") {
        parts.push("&&");
    }
    if (func.isNoexcept) {
        if (func.noexceptExpression) {
            parts.push(`noexcept(${func.noexceptExpression})`);
        } else {
            parts.push("noexcept");
        }
    }
    // Check for override in the raw signature
    if (func.signature.includes(" override")) {
        parts.push("override");
    }

    if (parts.length === 0) {
        return "";
    }
    return " " + parts.join(" ");
}

/**
 * Find matching closing paren, respecting nesting.
 */
function findMatchingParen(str: string, openIndex: number): number {
    let depth = 0;
    for (let i = openIndex; i < str.length; i++) {
        if (str[i] === "(") {
            depth++;
        } else if (str[i] === ")") {
            depth--;
            if (depth === 0) {
                return i;
            }
        }
    }
    return -1;
}

/**
 * Split parameter list by commas, respecting angle brackets and parens.
 */
function splitParams(paramsStr: string): string[] {
    const result: string[] = [];
    let depth = 0; // tracks < > and ( ) nesting
    let current = "";

    for (let i = 0; i < paramsStr.length; i++) {
        const ch = paramsStr.charAt(i);
        if (ch === "<" || ch === "(") {
            depth++;
            current += ch;
        } else if (ch === ">" || ch === ")") {
            depth--;
            current += ch;
        } else if (ch === "," && depth === 0) {
            result.push(current);
            current = "";
        } else {
            current += ch;
        }
    }

    if (current.trim()) {
        result.push(current);
    }

    return result;
}

// ---------------------------------------------------------------------------
// CodeBlock rendering
// ---------------------------------------------------------------------------

/**
 * Format a links record as JSON with spaces after colons and commas.
 * Produces `{"key": "/path", "key2": "/path2"}` instead of `{"key":"/path","key2":"/path2"}`.
 */
export function formatLinksJson(links: Record<string, string>): string {
    const entries = Object.entries(links).map(([key, value]) => `"${key}": "${value}"`);
    return `{${entries.join(", ")}}`;
}

/**
 * Render a CodeBlock MDX component with optional links.
 */
export function renderCodeBlock(code: string, links: Record<string, string>): string {
    const hasLinks = Object.keys(links).length > 0;
    const linksStr = hasLinks ? ` links={${formatLinksJson(links)}}` : "";

    return [`<CodeBlock${linksStr}>`, "```cpp showLineNumbers={false}", code, "```", "</CodeBlock>"].join("\n");
}

/**
 * Render a class template signature as a CodeBlock component with anchor ID.
 *
 * Displays the template parameters and class declaration in a code block.
 * Includes anchor ID for linking to the class signature.
 *
 * Example output:
 * ```cpp
 * template <typename T, int BlockDimX, BlockScanAlgorithm Algorithm = BLOCK_SCAN_RAKING>
 * class BlockScan
 * ```
 */
export function renderClassTemplateSignature(cls: CppClassIr, ctx: RenderContext): string {
    // Skip if no template parameters
    if (cls.templateParams.length === 0) {
        return "";
    }

    // Filter out SFINAE parameters
    const renderableParams = cls.templateParams.filter((tp) => !isSfinaeParam(tp));
    if (renderableParams.length === 0) {
        return "";
    }

    // Format template parameters
    const params = renderableParams.map(formatTemplateParam);

    // Build template line with multi-line formatting for readability
    let templateLine: string;
    const joined = params.join(", ");
    if (joined.length > 80) {
        templateLine = `template <${params.join(",\n          ")}>`;
    } else {
        templateLine = `template <${joined}>`;
    }

    // Get the short class name for the class declaration line
    const className = getShortName(cls.path);
    const classKind = cls.kind; // "class" or "struct"
    const classLine = `${classKind} ${className}`;

    // Build the signature
    const signature = [templateLine, classLine].join("\n");

    // Build links for template parameters and class name
    const links = extractClassTemplateLinks(cls, ctx);

    // Add anchor ID for the class name
    const anchorId = ` id="${className}"`;
    const codeBlockStart = `<CodeBlock${anchorId}`;
    const linksStr = Object.keys(links).length > 0 ? ` links={${formatLinksJson(links)}}` : "";

    return [`${codeBlockStart}${linksStr}>`, "```cpp showLineNumbers={false}", signature, "```", "</CodeBlock>"].join(
        "\n"
    );
}

/**
 * Extract links for class template signature (template parameters and class name).
 */
function extractClassTemplateLinks(cls: CppClassIr, ctx: RenderContext): Record<string, string> {
    const links: Record<string, string> = {};

    // Add link for the class itself
    const className = getShortName(cls.path);
    const classLinkPath = buildLinkPath(cls.path);
    if (classLinkPath) {
        links[className] = classLinkPath;
    }

    // Extract links from template parameters
    for (const param of cls.templateParams) {
        // Template parameters don't have typeInfo, but their defaultValue might
        if (param.defaultValue?.parts) {
            const paramLinks = extractLinksFromTypeInfo(param.defaultValue);
            for (const [key, value] of paramLinks) {
                if (!links[key]) {
                    links[key] = value;
                }
            }
        }
    }

    return links;
}

/**
 * Render a bare code block (no CodeBlock component wrapper).
 * Used for include headers and method-level examples.
 */
export function renderBareCodeBlock(code: string, language: string = "cpp"): string {
    return [`\`\`\`${language} showLineNumbers={false}`, code, "```"].join("\n");
}
