/**
 * Renders template parameter and function parameter sections as ParamField components.
 *
 * Handles:
 * - Class-level template parameters (**Template parameters** heading)
 * - Method-level template parameters (**Template parameters** heading)
 * - Method-level parameters (**Parameters** heading)
 * - Default values
 * - [optional] and [inferred] prefixes
 */

import type {
    CppDocstringIr,
    CppFunctionIr,
    CppMacroIr,
    CppParamDoc,
    CppTemplateParamIr,
    CppTypedefIr
} from "../../../src/types/CppLibraryDocsIr.js";
import { renderSegmentsTrimmed } from "./DescriptionRenderer.js";
import { normalizeAngleBracketSpacing } from "./SignatureRenderer.js";

// ---------------------------------------------------------------------------
// Description capitalization
// ---------------------------------------------------------------------------

/**
 * Capitalize the first character of a description string.
 * Returns the string unchanged if it's empty or already capitalized.
 *
 * Skips past leading bold prefix patterns like `**[optional]** ` or
 * `**[inferred]** ` before finding the first alphabetic character to capitalize.
 */
function capitalizeDescription(desc: string): string {
    if (!desc) {
        return desc;
    }

    // Check for leading bold prefix patterns like **[optional]** or **[inferred]**
    // These are special tags that should not have their content capitalized.
    // Skip past them and capitalize the first alphabetic char in the text that follows.
    const boldPrefixMatch = desc.match(/^(\*\*\[[^\]]+\]\*\*\s*)/);
    const startOffset = boldPrefixMatch?.[1] != null ? boldPrefixMatch[1].length : 0;

    // Do not capitalize if the first non-prefix character starts a markdown link [...]
    if (desc[startOffset] === "[") {
        return desc;
    }

    // Find the first alphabetic character starting from the offset
    for (let i = startOffset; i < desc.length; i++) {
        const ch = desc.charAt(i);
        if (/[a-z]/.test(ch)) {
            return desc.substring(0, i) + ch.toUpperCase() + desc.substring(i + 1);
        }
        if (/[A-Z]/.test(ch)) {
            // Already capitalized
            return desc;
        }
    }
    return desc;
}

// ---------------------------------------------------------------------------
// ParamField rendering
// ---------------------------------------------------------------------------

/**
 * Render a single ParamField component.
 */
function renderParamField(
    name: string,
    type: string,
    defaultValue: string | undefined,
    description: string | undefined
): string {
    const props: string[] = [`path="${name}"`];
    if (type) {
        props.push(`type="${type}"`);
    }
    if (defaultValue) {
        props.push(`default="${defaultValue}"`);
    }

    if (description) {
        return `<ParamField ${props.join(" ")}>\n${description}\n</ParamField>`;
    }
    // Render empty ParamField (no description) — self-closing body required by MDX
    return `<ParamField ${props.join(" ")}>\n</ParamField>`;
}

// ---------------------------------------------------------------------------
// SFINAE detection
// ---------------------------------------------------------------------------

/**
 * Check whether a template parameter is an SFINAE / enable_if param
 * that should be filtered out from rendered output.
 */
export function isSfinaeParam(tp: CppTemplateParamIr): boolean {
    const type = tp.type ?? "";
    return type.includes("enable_if") || type.includes("_EnableIf");
}

// ---------------------------------------------------------------------------
// Template parameters
// ---------------------------------------------------------------------------

/**
 * Parse template param type to extract the type keyword and parameter name.
 * e.g., "typename T" -> { type: "typename", name: "T" }
 * e.g., "int" with name "BlockDimX" -> { type: "int", name: "BlockDimX" }
 * e.g., "class..." with name "_Properties" -> { type: "class...", name: "_Properties" }
 */
function parseTemplateParam(tp: CppTemplateParamIr): { typePart: string; namePart: string } {
    if (tp.name) {
        // Check if type already contains the name
        if (tp.type.endsWith(` ${tp.name}`)) {
            const typePart = tp.type.substring(0, tp.type.length - tp.name.length - 1);
            return { typePart, namePart: tp.name };
        }
        // Type is separate from name
        return { typePart: tp.type, namePart: tp.name };
    }
    // Name embedded in type string: "typename T", "class _Resource"
    const parts = tp.type.split(/\s+/);
    if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1] ?? "";
        const typePart = parts.slice(0, -1).join(" ");
        return { typePart, namePart: lastPart };
    }
    return { typePart: tp.type, namePart: tp.type };
}

/**
 * Render class-level template parameters with bold heading (consistent with method-level format).
 */
export function renderClassTemplateParams(
    templateParams: CppTemplateParamIr[],
    docstring: CppDocstringIr | undefined
): string {
    if (templateParams.length === 0) {
        return "";
    }

    // Filter out SFINAE / enable_if template params that should not be rendered
    const renderableParams = templateParams.filter((tp) => !isSfinaeParam(tp));

    if (renderableParams.length === 0) {
        return "";
    }

    const lines: string[] = [];
    lines.push("**Template parameters**");
    lines.push("");

    for (let i = 0; i < renderableParams.length; i++) {
        const tp = renderableParams[i];
        if (tp == null) {
            continue;
        }
        const { typePart, namePart } = parseTemplateParam(tp);

        // Find description from docstring templateParamsDoc or params
        const description = findTemplateParamDescription(namePart, docstring);

        // Default value
        const defaultVal = tp.defaultValue?.display;

        // Handle variadic display: "class..." for variadic params
        let displayType = typePart;
        if (tp.isVariadic && !displayType.endsWith("...")) {
            displayType = displayType + "...";
        }

        // Variadic param name display: append "..." if the name doesn't already have it
        let displayName = namePart;
        if (tp.isVariadic && !displayName.endsWith("...")) {
            displayName = displayName + "...";
        }

        const field = renderParamField(displayName, displayType, defaultVal, description);
        if (field) {
            lines.push(field);
            if (i < renderableParams.length - 1) {
                lines.push("");
            }
        }
    }

    // Remove trailing blank line
    if (lines[lines.length - 1] === "") {
        lines.pop();
    }

    return lines.join("\n");
}

/**
 * Normalize a template param name by stripping trailing `...`.
 * The IR's templateParamsDoc may use "_Properties..." while the parsed name
 * from the type string is "_Properties" (without "..."). This function
 * strips the trailing "..." so both sides can be compared.
 */
function normalizeTemplateParamName(name: string): string {
    return name.endsWith("...") ? name.slice(0, -3) : name;
}

/**
 * Find a template parameter's description from docstring.
 *
 * When `includeParams` is true (default), also searches the docstring's
 * `params` array as a fallback — some parsers put template param docs there.
 * Class-level lookups use this fallback; method-level lookups do not.
 */
function findTemplateParamDescription(
    name: string,
    docstring: CppDocstringIr | undefined,
    options: { includeParams?: boolean } = { includeParams: true }
): string | undefined {
    if (!docstring) {
        return undefined;
    }

    const normalizedName = normalizeTemplateParamName(name);

    // Check templateParamsDoc first
    for (const p of docstring.templateParamsDoc) {
        // Normalize both sides to strip trailing "..." for variadic param matching
        if (normalizeTemplateParamName(p.name) === normalizedName) {
            const desc = renderSegmentsTrimmed(p.description);
            // Capitalize the first character of the description
            return desc ? capitalizeDescription(desc) : undefined;
        }
    }

    // Also check params (some parsers put template params there)
    if (options.includeParams) {
        for (const p of docstring.params) {
            if (normalizeTemplateParamName(p.name) === normalizedName) {
                const desc = renderSegmentsTrimmed(p.description);
                // Capitalize the first character of the description
                return desc ? capitalizeDescription(desc) : undefined;
            }
        }
    }

    return undefined;
}

/**
 * Render method-level template parameters (**Template parameters** heading).
 */
export function renderMethodTemplateParams(func: CppFunctionIr, docstring: CppDocstringIr | undefined): string {
    if (func.templateParams.length === 0) {
        return "";
    }

    // Filter out SFINAE / enable_if template params and unnamed params
    const renderableParams = func.templateParams.filter((tp) => {
        const { namePart } = parseTemplateParam(tp);
        // Skip unnamed params or SFINAE enable_if params
        if (!namePart || namePart === tp.type) {
            return false;
        }
        return !isSfinaeParam(tp);
    });

    if (renderableParams.length === 0) {
        return "";
    }

    // Check if any renderable template param has a description (from docstring)
    const hasAnyDescription = renderableParams.some((tp) => {
        const { namePart } = parseTemplateParam(tp);
        return findTemplateParamDescription(namePart, docstring, { includeParams: false }) != null;
    });

    if (!hasAnyDescription) {
        return "";
    }

    const lines: string[] = [];
    lines.push("**Template parameters**");
    lines.push("");

    for (let i = 0; i < renderableParams.length; i++) {
        const tp = renderableParams[i];
        if (tp == null) {
            continue;
        }
        const { typePart, namePart } = parseTemplateParam(tp);

        const description = findTemplateParamDescription(namePart, docstring, { includeParams: false });
        if (!description) {
            continue;
        }

        const field = renderParamField(namePart, typePart, undefined, description);
        if (field) {
            lines.push(field);
            // Add blank line between fields
            lines.push("");
        }
    }

    // Remove trailing blank line
    if (lines[lines.length - 1] === "") {
        lines.pop();
    }

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Function parameters
// ---------------------------------------------------------------------------

/**
 * Render method-level parameters (**Parameters** heading).
 */
export function renderMethodParams(func: CppFunctionIr, docstring: CppDocstringIr | undefined): string {
    if (func.parameters.length === 0) {
        return "";
    }

    // Check if any parameter has a description
    const paramsWithDesc = func.parameters.filter((p) => {
        const desc = findParamDescription(p.name, docstring);
        return desc != null;
    });

    if (paramsWithDesc.length === 0) {
        return "";
    }

    const lines: string[] = [];
    lines.push("**Parameters**");
    lines.push("");

    for (let i = 0; i < func.parameters.length; i++) {
        const param = func.parameters[i];
        if (param == null) {
            continue;
        }
        // Skip unnamed params (e.g., dummy int for postfix operators)
        if (!param.name || param.name.length === 0) {
            continue;
        }
        const description = findParamDescription(param.name, docstring);
        if (!description) {
            continue;
        }

        // Append arraySuffix to the type display when present
        // e.g., typeInfo.display="T(&)" + arraySuffix="[ITEMS_PER_THREAD]" -> "T(&)[ITEMS_PER_THREAD]"
        let typeDisplay = normalizeAngleBracketSpacing(param.typeInfo?.display ?? "");
        if (param.arraySuffix) {
            typeDisplay = typeDisplay + param.arraySuffix;
        }
        const defaultVal = param.defaultValue?.display;

        const field = renderParamField(param.name, typeDisplay, defaultVal, description);
        if (field) {
            lines.push(field);
            lines.push("");
        }
    }

    // Remove trailing blank line
    if (lines[lines.length - 1] === "") {
        lines.pop();
    }

    return lines.join("\n");
}

/**
 * Render a function-like macro's parameters (**Parameters** heading).
 * Macro parameters are untyped, so only the name and description are shown.
 */
export function renderMacroParams(macro: CppMacroIr, docstring: CppDocstringIr | undefined): string {
    const documented = (macro.parameters ?? []).flatMap((name) => {
        const description = findParamDescription(name, docstring);
        return description ? [{ name, description }] : [];
    });
    if (documented.length === 0) {
        return "";
    }
    const lines = ["**Parameters**", ""];
    for (const { name, description } of documented) {
        lines.push(renderParamField(name, "", undefined, description));
        lines.push("");
    }
    lines.pop();
    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Function-pointer typedef parameters
// ---------------------------------------------------------------------------

const FUNCTION_POINTER_RE = /^(.*?)\(\s*\*\s*\)\s*\((.*)\)\s*$/s;

export interface FunctionPointerParts {
    returnType: string;
    params: string[];
}

/**
 * Split a function-pointer type display such as `void(*)(int a, void *ctx)`
 * into its return type and top-level parameter declarations.
 */
export function parseFunctionPointerType(display: string): FunctionPointerParts | undefined {
    const match = display.match(FUNCTION_POINTER_RE);
    if (match?.[1] == null || match[2] == null) {
        return undefined;
    }
    const returnType = match[1].trim();
    const paramList = match[2].trim();
    if (!paramList || paramList === "void") {
        return { returnType, params: [] };
    }
    const params: string[] = [];
    let depth = 0;
    let current = "";
    for (const ch of paramList) {
        if (ch === "(" || ch === "<" || ch === "[") {
            depth++;
        } else if (ch === ")" || ch === ">" || ch === "]") {
            depth--;
        }
        if (ch === "," && depth === 0) {
            params.push(current.trim());
            current = "";
        } else {
            current += ch;
        }
    }
    if (current.trim()) {
        params.push(current.trim());
    }
    return { returnType, params };
}

/**
 * Split a parameter declaration (`const float *solution`) into type and name.
 */
function splitParamDeclaration(decl: string): { type: string; name: string | undefined } {
    const match = decl.match(/^(.*?[\s*&])\s*([A-Za-z_]\w*)(\[[^\]]*\])?$/s);
    if (match?.[1] == null || match[2] == null) {
        return { type: decl, name: undefined };
    }
    return { type: normalizeAngleBracketSpacing(match[1].trim()) + (match[3] ?? ""), name: match[2] };
}

/**
 * Render the documented parameters of a function-pointer typedef (**Parameters** heading).
 */
export function renderTypedefParams(typedef: CppTypedefIr, docstring: CppDocstringIr | undefined): string {
    if (!docstring || docstring.params.length === 0 || !typedef.typeInfo?.display) {
        return "";
    }
    const parsed = parseFunctionPointerType(typedef.typeInfo.display);
    if (!parsed) {
        return "";
    }
    const declared = parsed.params.map(splitParamDeclaration);
    const lines = ["**Parameters**", ""];
    let rendered = 0;
    for (const decl of declared) {
        if (!decl.name) {
            continue;
        }
        const description = findParamDescription(decl.name, docstring);
        if (!description) {
            continue;
        }
        lines.push(renderParamField(decl.name, decl.type, undefined, description));
        lines.push("");
        rendered++;
    }
    if (rendered === 0) {
        return "";
    }
    lines.pop();
    return lines.join("\n");
}

/**
 * Build the rendered description for a documented parameter: optional Doxygen
 * direction marker (`[in]`, `[out]`, `[in,out]`) followed by the description text.
 */
function formatParamDoc(p: CppParamDoc): string | undefined {
    let desc = renderSegmentsTrimmed(p.description);
    if (!desc) {
        return undefined;
    }
    // Doxygen keeps the author's `@param name - text` dash; the ParamField already separates them.
    desc = desc.replace(/^[-–—]\s+/, "");
    desc = capitalizeDescription(desc);
    if (p.direction) {
        const marker = p.direction === "inout" ? "in,out" : p.direction;
        return `**[${marker}]** ${desc}`;
    }
    return desc;
}

/**
 * Find a parameter's description from docstring.
 */
function findParamDescription(name: string, docstring: CppDocstringIr | undefined): string | undefined {
    if (!docstring) {
        return undefined;
    }

    for (const p of docstring.params) {
        if (p.name === name) {
            return formatParamDoc(p);
        }
    }

    return undefined;
}
