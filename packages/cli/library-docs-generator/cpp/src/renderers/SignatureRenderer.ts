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

import type {
    CppClassIr,
    CppFunctionIr,
    CppTypeInfo
} from "../../../src/types/CppLibraryDocsIr.js";
import { buildLinkPath, getShortName, stripTemplateArgs, type RenderContext } from "../context.js";
import { isTypeRef, decodeDoxygenRefid } from "./DescriptionRenderer.js";

// ---------------------------------------------------------------------------
// Angle bracket spacing normalization (BUG 13)
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
        const ch = chars[i]!;
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
// Default value spacing normalization (BUG 21)
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
 */
function extractLinksFromTypeInfo(typeInfo: CppTypeInfo | undefined): Map<string, string> {
    const links = new Map<string, string>();
    if (!typeInfo) {
        return links;
    }
    for (const part of typeInfo.parts) {
        if (isTypeRef(part) && part.kindref === "compound") {
            // Extract the short name for the link key
            const shortName = getShortName(part.text);
            // Use decoded refid for fully-qualified path, falling back to part.text
            const qualifiedName = decodeDoxygenRefid(part.refid) ?? part.text;
            links.set(shortName, buildLinkPath(qualifiedName));
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
        links[shortName] = buildLinkPath(ownerClass.path);
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
 * BUG 12 fix: For base class links, use the short class name (without template
 * args) as the link key, and strip template args from the URL path.
 * Golden pages show e.g., "iterator_adaptor": "/library/api/thrust::iterator_adaptor"
 * not the full templated form.
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
            // BUG 12: Use short base class name (without template args) as key
            const baseName = stripTemplateArgs(base.name);
            const shortBaseName = getShortName(baseName);
            if (!links[shortBaseName]) {
                // URL also uses qualified name without template args
                links[shortBaseName] = buildLinkPath(baseName);
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

    // Template prefix
    if (func.templateParams.length > 0) {
        const templateLine = formatTemplateLine(func);
        parts.push(templateLine);
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
    const params = func.templateParams.map(tp => {
        if (tp.name) {
            // BUG 16: For variadic params, the name may be separate from the type
            // e.g., type="class...", name="_Properties" -> "class... _Properties"
            if (tp.isVariadic) {
                // Check if the type already contains the name
                if (tp.type.includes(tp.name)) {
                    return tp.type;
                }
                return `${tp.type} ${tp.name}`;
            }
            // Check if the type already contains the name
            if (tp.type.includes(tp.name)) {
                return tp.type;
            }
            return `${tp.type} ${tp.name}`;
        }
        return tp.type;
    });

    // Check if we need multi-line formatting (SFINAE / enable_if patterns)
    const joined = params.join(", ");
    if (joined.length > 80 || joined.includes("enable_if")) {
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
    // BUG 13: Normalize angle bracket spacing in the raw signature
    let sig = normalizeAngleBracketSpacing(func.signature);

    // BUG 9 fix: If this method is inherited (its path references a base class),
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
    // Special case: operator() -- the first "()" is part of the operator name,
    // so we need to skip past it to find the actual parameter list.
    let openParen = sig.indexOf("(");
    if (openParen === -1) {
        // No params (shouldn't happen for functions, but handle gracefully)
        return sig;
    }

    // Check if this `(` is part of `operator()`
    const operatorCallIdx = sig.indexOf("operator()");
    if (operatorCallIdx !== -1 && openParen === operatorCallIdx + "operator".length) {
        // The first `(` is part of `operator()` -- skip past the `operator()` token
        // to find the real parameter list opening paren
        const afterOperatorCall = operatorCallIdx + "operator()".length;
        const realOpenParen = sig.indexOf("(", afterOperatorCall);
        if (realOpenParen !== -1) {
            openParen = realOpenParen;
        } else {
            // No actual parameter list found after operator() -- return as-is
            return sig;
        }
    }

    // Find the matching closing paren
    const closeParen = findMatchingParen(sig, openParen);
    if (closeParen === -1) {
        return sig;
    }

    const prefix = sig.substring(0, openParen);
    // BUG 21: Normalize default value spacing in parameters (add spaces around `=`)
    const paramsStr = normalizeDefaultValueSpacing(sig.substring(openParen + 1, closeParen));

    // Detect deleted status from both IR field AND signature string
    // (the IR's isDeleted field is unreliable -- often false even when signature has =delete)
    const sigHasDelete = /=\s*delete\s*$/.test(sig);
    const deleteSuffix = (func.isDeleted || sigHasDelete) ? " = delete" : "";

    // BUG 27 fix: Detect =default in the signature string (no IR field for this)
    const sigHasDefault = /=\s*default\s*$/.test(sig);
    const defaultSuffix = sigHasDefault ? " = default" : "";

    // Strip =delete from the working signature to avoid duplication
    // (we add it back properly via deleteSuffix)
    if (sigHasDelete) {
        sig = sig.replace(/\s*=\s*delete\s*$/, "");
    }

    // BUG 27: Strip =default from the working signature to avoid duplication
    if (sigHasDefault) {
        sig = sig.replace(/\s*=\s*default\s*$/, "");
    }

    // Build the const/noexcept suffix from IR fields (more reliable than parsing)
    const quals = buildQualifierSuffix(func);

    // BUG 27: Combine suffixes (mutually exclusive: a function is either deleted, defaulted, or neither)
    const specialSuffix = deleteSuffix || defaultSuffix;

    if (!paramsStr.trim()) {
        // No parameters
        return `${prefix}()${quals}${specialSuffix}`;
    }

    // Split parameters (respect template angle brackets and nested parens)
    const params = splitParams(paramsStr);

    if (params.length <= 1) {
        // Single parameter: use compact format if it fits, multi-line otherwise
        const singleParam = params[0]?.trim() ?? "";
        const oneLiner = `${prefix}(${singleParam})${quals}${specialSuffix}`;
        if (oneLiner.length <= 100) {
            return oneLiner;
        }
        return `${prefix}(\n    ${singleParam}\n)${quals}${specialSuffix}`;
    }

    // Multi-parameter: one per line, indented with 4 spaces
    const formattedParams = params.map((p, i) => {
        const trimmed = p.trim();
        const comma = i < params.length - 1 ? "," : "";
        return `    ${trimmed}${comma}`;
    });

    return [
        `${prefix}(`,
        ...formattedParams,
        `)${quals}${specialSuffix}`
    ].join("\n");
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
        const ch = paramsStr[i]!;
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
 * BUG 14: Format a links record as JSON with spaces after colons and commas.
 * Produces `{"key": "/path", "key2": "/path2"}` instead of `{"key":"/path","key2":"/path2"}`.
 */
export function formatLinksJson(links: Record<string, string>): string {
    const entries = Object.entries(links).map(
        ([key, value]) => `"${key}": "${value}"`
    );
    return `{${entries.join(", ")}}`;
}

/**
 * Render a CodeBlock MDX component with optional links.
 */
export function renderCodeBlock(code: string, links: Record<string, string>): string {
    const hasLinks = Object.keys(links).length > 0;
    const linksStr = hasLinks ? ` links={${formatLinksJson(links)}}` : "";

    return [
        `<CodeBlock${linksStr}>`,
        "```cpp showLineNumbers={false}",
        code,
        "```",
        "</CodeBlock>"
    ].join("\n");
}

/**
 * Render a bare code block (no CodeBlock component wrapper).
 * Used for include headers and method-level examples.
 */
export function renderBareCodeBlock(code: string, language: string = "cpp"): string {
    return [
        `\`\`\`${language} showLineNumbers={false}`,
        code,
        "```"
    ].join("\n");
}
