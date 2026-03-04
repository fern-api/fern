/**
 * Renders template parameter and function parameter sections as ParamField components.
 *
 * Handles:
 * - Class-level template parameters (wrapped in AccordionGroup/Accordion)
 * - Method-level template parameters (**Template parameters** heading)
 * - Method-level parameters (**Parameters** heading)
 * - Default values
 * - [optional] and [inferred] prefixes
 */

import type {
    CppDocSegment,
    CppDocstringIr,
    CppFunctionIr,
    CppParameterIr,
    CppParamDoc,
    CppTemplateParamIr,
    CppTypeInfo
} from "../../../src/types/CppLibraryDocsIr.js";
import { renderSegmentsTrimmed } from "./DescriptionRenderer.js";

// ---------------------------------------------------------------------------
// Description trailing period and capitalization
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Description capitalization (BUG 24)
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
    const startOffset = boldPrefixMatch ? boldPrefixMatch[1]!.length : 0;

    // Find the first alphabetic character starting from the offset
    for (let i = startOffset; i < desc.length; i++) {
        const ch = desc[i]!;
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
    const props: string[] = [`path="${name}"`, `type="${type}"`];
    if (defaultValue) {
        props.push(`default="${defaultValue}"`);
    }

    if (description) {
        return `<ParamField ${props.join(" ")}>\n${description}\n</ParamField>`;
    }
    // Omit empty ParamField per rendering rules
    return "";
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
        const lastPart = parts[parts.length - 1]!;
        const typePart = parts.slice(0, -1).join(" ");
        return { typePart, namePart: lastPart };
    }
    return { typePart: tp.type, namePart: tp.type };
}

/**
 * Render class-level template parameters wrapped in AccordionGroup/Accordion.
 */
export function renderClassTemplateParams(
    templateParams: CppTemplateParamIr[],
    docstring: CppDocstringIr | undefined
): string {
    if (templateParams.length === 0) {
        return "";
    }

    const lines: string[] = [];
    lines.push("<AccordionGroup>");
    lines.push('<Accordion title="Template parameters">');
    lines.push("");

    for (let i = 0; i < templateParams.length; i++) {
        const tp = templateParams[i]!;
        const { typePart, namePart } = parseTemplateParam(tp);

        // Find description from docstring templateParamsDoc or params
        const description = findTemplateParamDescription(namePart, docstring);

        // Default value
        const defaultVal = tp.defaultValue?.display;

        // Use description as-is -- the IR description segments already contain
        // [optional] prefix when appropriate (BLOCKER 8 fix)
        const descText = description;

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

        const field = renderParamField(displayName, displayType, defaultVal, descText || undefined);
        if (field) {
            lines.push(field);
            if (i < templateParams.length - 1) {
                lines.push("");
            }
        }
    }

    lines.push("");
    lines.push("</Accordion>");
    lines.push("</AccordionGroup>");

    return lines.join("\n");
}

/**
 * BUG 17: Normalize a template param name by stripping trailing `...`.
 * The IR's templateParamsDoc may use "_Properties..." while the parsed name
 * from the type string is "_Properties" (without "..."). This function
 * strips the trailing "..." so both sides can be compared.
 */
function normalizeTemplateParamName(name: string): string {
    return name.endsWith("...") ? name.slice(0, -3) : name;
}

/**
 * Find a template parameter's description from docstring.
 */
function findTemplateParamDescription(
    name: string,
    docstring: CppDocstringIr | undefined
): string | undefined {
    if (!docstring) {
        return undefined;
    }

    const normalizedName = normalizeTemplateParamName(name);

    // Check templateParamsDoc first
    for (const p of docstring.templateParamsDoc) {
        // BUG 17: Normalize both sides to strip trailing "..."
        if (normalizeTemplateParamName(p.name) === normalizedName) {
            const desc = renderSegmentsTrimmed(p.description);
            // BUG 24: Capitalize the first character of the description
            return desc ? capitalizeDescription(desc) : undefined;
        }
    }

    // Also check params (some parsers put template params there)
    for (const p of docstring.params) {
        if (normalizeTemplateParamName(p.name) === normalizedName) {
            const desc = renderSegmentsTrimmed(p.description);
            // BUG 24: Capitalize the first character of the description
            return desc ? capitalizeDescription(desc) : undefined;
        }
    }

    return undefined;
}

/**
 * Render method-level template parameters (**Template parameters** heading).
 */
export function renderMethodTemplateParams(
    func: CppFunctionIr,
    docstring: CppDocstringIr | undefined
): string {
    if (func.templateParams.length === 0) {
        return "";
    }

    // Check if any template param has a description (from docstring)
    const hasAnyDescription = func.templateParams.some(tp => {
        const { namePart } = parseTemplateParam(tp);
        return findMethodTemplateParamDescription(namePart, docstring) != null;
    });

    if (!hasAnyDescription) {
        return "";
    }

    const lines: string[] = [];
    lines.push("**Template parameters**");
    lines.push("");

    for (let i = 0; i < func.templateParams.length; i++) {
        const tp = func.templateParams[i]!;
        const { typePart, namePart } = parseTemplateParam(tp);

        const description = findMethodTemplateParamDescription(namePart, docstring);
        if (!description) {
            continue;
        }

        // Use description as-is -- the IR description segments already contain
        // [inferred] prefix when appropriate (BLOCKER 9 fix)
        const descText = description;

        const field = renderParamField(namePart, typePart, undefined, descText);
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

/**
 * Find template param description from function-level docstring.
 */
function findMethodTemplateParamDescription(
    name: string,
    docstring: CppDocstringIr | undefined
): string | undefined {
    if (!docstring) {
        return undefined;
    }

    const normalizedName = normalizeTemplateParamName(name);

    for (const p of docstring.templateParamsDoc) {
        // BUG 17: Normalize both sides to strip trailing "..."
        if (normalizeTemplateParamName(p.name) === normalizedName) {
            const desc = renderSegmentsTrimmed(p.description);
            // BUG 24: Capitalize the first character of the description
            return desc ? capitalizeDescription(desc) : undefined;
        }
    }

    return undefined;
}

// ---------------------------------------------------------------------------
// Function parameters
// ---------------------------------------------------------------------------

/**
 * Render method-level parameters (**Parameters** heading).
 */
export function renderMethodParams(
    func: CppFunctionIr,
    docstring: CppDocstringIr | undefined
): string {
    if (func.parameters.length === 0) {
        return "";
    }

    // Check if any parameter has a description
    const paramsWithDesc = func.parameters.filter(p => {
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
        const param = func.parameters[i]!;
        const description = findParamDescription(param.name, docstring);
        if (!description) {
            continue;
        }

        // BUG 25: Append arraySuffix to the type display when present
        // e.g., typeInfo.display="T(&)" + arraySuffix="[ITEMS_PER_THREAD]" -> "T(&)[ITEMS_PER_THREAD]"
        let typeDisplay = param.typeInfo?.display ?? "";
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
 * Find a parameter's description from docstring.
 */
function findParamDescription(
    name: string,
    docstring: CppDocstringIr | undefined
): string | undefined {
    if (!docstring) {
        return undefined;
    }

    for (const p of docstring.params) {
        if (p.name === name) {
            const desc = renderSegmentsTrimmed(p.description);
            // BUG 24: Capitalize the first character of the description
            return desc ? capitalizeDescription(desc) : undefined;
        }
    }

    return undefined;
}
