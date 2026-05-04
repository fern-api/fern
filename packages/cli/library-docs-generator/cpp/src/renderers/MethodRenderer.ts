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

import type { CppClassIr, CppDocstringIr, CppFunctionIr } from "../../../src/types/CppLibraryDocsIr.js";
import type { RenderContext } from "../context.js";
import { buildLinkPath, getShortName, OPERATOR_SYMBOL_MAP } from "../context.js";
import { getCommonQualifiers, getOverloadSpecificQualifiers, renderBadges } from "./BadgeRenderer.js";
import { renderDescriptionBlocksDeduped, renderSeeAlso, renderSegmentsTrimmed } from "./DescriptionRenderer.js";
import { renderMethodParams, renderMethodTemplateParams } from "./ParamRenderer.js";
import { renderBareCodeBlock, renderCodeBlock, renderSignatureCodeBlock } from "./SignatureRenderer.js";
import { escapeMdxText, isEffectivelyDeleted, renderCallout, trimTrailingBlankLines } from "./shared.js";

// ---------------------------------------------------------------------------
// Custom anchor ID generation
// ---------------------------------------------------------------------------

export function methodAnchorId(name: string): string {
    for (const [symbol, safeName] of OPERATOR_SYMBOL_MAP) {
        if (name === symbol) {
            return safeName;
        }
    }
    const result = name.toLowerCase().replace(/[^a-z0-9-]/g, "");
    return result || "unknown";
}

// ---------------------------------------------------------------------------
// Tab title generation
// ---------------------------------------------------------------------------

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
        trimmed = trimmed[0]?.toUpperCase() + trimmed.slice(1);
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
        const ch = str.charAt(i);
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
 * Check whether the last parameter looks like an allocator type.
 * Common patterns: const Alloc&, const Allocator&, or any type whose name
 * matches a known allocator-like pattern.
 */
function lastParamIsAllocator(func: CppFunctionIr): boolean {
    if (func.parameters.length === 0) {
        return false;
    }
    const lastParam = func.parameters[func.parameters.length - 1];
    if (lastParam == null) {
        return false;
    }
    const name = lastParam.name ?? "";
    const type = lastParam.typeInfo?.display ?? "";
    // Param named "alloc" or "allocator" is a strong signal
    if (name === "alloc" || name === "allocator") {
        return true;
    }
    // Type containing "Alloc" or "allocator" (e.g., "const Alloc &", "const Allocator &")
    if (/\bAlloc(ator)?\b/.test(type) && type.includes("const") && type.includes("&")) {
        return true;
    }
    return false;
}

/**
 * Build a base constructor title from the non-allocator parameters, then
 * append " with allocator" if the last param is an allocator.
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

    const hasAlloc = lastParamIsAllocator(func);
    // "Core" params are all params except the trailing allocator (if present)
    const coreParams = hasAlloc ? func.parameters.slice(0, -1) : func.parameters;
    const allocSuffix = hasAlloc ? " with allocator" : "";

    // If the only param is the allocator, this is a "With allocator" constructor
    if (coreParams.length === 0 && hasAlloc) {
        return "With allocator";
    }

    // Parameter-based heuristics on core params
    const baseTitle = constructorBaseTitleFromParams(func, coreParams);
    if (baseTitle) {
        return baseTitle + allocSuffix;
    }

    // Use summary as fallback (for cases like "Device and priority" where params
    // don't match any known pattern)
    if (func.docstring?.summary && func.docstring.summary.length > 0) {
        const summary = renderSegmentsTrimmed(func.docstring.summary);
        const title = trimToNounPhrase(summary, 50);
        if (title) {
            return title;
        }
    }

    // Fall back to numbered title
    return `Overload ${index + 1}`;
}

/**
 * Check whether a type string refers to an OtherProperties / _OtherProperties
 * cross-type constructor parameter (e.g. `flat_hash_map<OtherProperties>`).
 */
function isOtherPropertiesType(typeStr: string): boolean {
    return typeStr.includes("OtherProperties") || typeStr.includes("_OtherProperties");
}

/**
 * Derive a base constructor tab title from the core (non-allocator) parameters.
 * Returns undefined if no known pattern matches.
 */
function constructorBaseTitleFromParams(
    func: CppFunctionIr,
    coreParams: CppFunctionIr["parameters"]
): string | undefined {
    if (coreParams.length === 0) {
        return undefined;
    }

    const allTypes = coreParams.map((p) => p.typeInfo?.display ?? "").join(", ");

    // TempStorage pattern (any number of params)
    if (allTypes.includes("TempStorage") || coreParams.some((p) => p.name === "temp_storage")) {
        return "With TempStorage";
    }

    // Dispatch based on param count
    if (coreParams.length === 1) {
        return singleParamConstructorTitle(coreParams);
    }
    return multiParamConstructorTitle(coreParams, allTypes);
}

/**
 * Derive a constructor tab title from a single core parameter.
 * Handles: move, copy, nullptr, native handle, size, no_init, initializer_list,
 * raw pointer, and other pointer patterns.
 */
function singleParamConstructorTitle(coreParams: CppFunctionIr["parameters"]): string | undefined {
    const firstType = coreParams[0]?.typeInfo?.display ?? "";
    const firstName = coreParams[0]?.name ?? "";

    // Move constructor: T&& (non-const rvalue ref)
    if (firstType.includes("&&") && !firstType.includes("const")) {
        if (isOtherPropertiesType(firstType)) {
            return "From matching properties (move)";
        }
        return "Move";
    }
    // Copy constructor: const T& (same type)
    if (firstType.includes("const") && firstType.includes("&") && !firstType.includes("&&")) {
        // Check if it's a cross-type copy (different template params)
        if (isOtherPropertiesType(firstType)) {
            return "From matching properties (copy)";
        }
        if (firstType.includes("OtherT") || firstType.includes("OtherAlloc") || firstType.includes("Other")) {
            // Determine source type for "From X type" titles
            return detectSourceType(firstType);
        }
        return "Copy";
    }
    // From nullptr
    if (firstType.includes("nullptr_t")) {
        return "From nullptr";
    }
    // From native handle types (cudaStream_t, cudaEvent_t, etc.)
    if (firstType.includes("cudaStream_t") || firstType.includes("cudaEvent_t")) {
        return "From native handle";
    }
    // size_type param named "n" or "count" -> "From size"
    if (
        (firstName === "n" || firstName === "count") &&
        (firstType.includes("size_type") || firstType.includes("size_t"))
    ) {
        return "From size";
    }
    // no_init_t
    if (firstType.includes("no_init_t") || firstType.includes("noinit")) {
        return "No-init";
    }
    // initializer_list
    if (firstType.includes("initializer_list")) {
        return "From initializer_list";
    }
    // Explicit pointer param
    if (firstType.includes("*") && !firstType.includes("(")) {
        return "From raw pointer";
    }
    // From other pointer type
    if (firstType.includes("OtherPointer") || firstType.includes("Pointer")) {
        return "From other pointer";
    }

    return undefined;
}

/**
 * Derive a constructor tab title from multiple core parameters (2+).
 * Handles: size+init patterns, no_init, iterator range, range, initializer_list,
 * move/copy with allocator, and empty (infrastructure-only) constructors.
 */
function multiParamConstructorTitle(coreParams: CppFunctionIr["parameters"], allTypes: string): string | undefined {
    const firstType = coreParams[0]?.typeInfo?.display ?? "";
    const firstName = coreParams[0]?.name ?? "";

    // size_type + default_init_t -> "From size, default-initialized"
    if (
        (firstName === "n" || firstName === "count") &&
        (firstType.includes("size_type") || firstType.includes("size_t"))
    ) {
        const secondType = coreParams[1]?.typeInfo?.display ?? "";
        if (secondType.includes("default_init_t")) {
            return "From size, default-initialized";
        }
        if (secondType.includes("no_init_t")) {
            return "From size, no-init";
        }
        if (secondType.includes("value_type") || coreParams[1]?.name === "value") {
            return "From size and value";
        }
        // Just size param + something else
        return "From size";
    }

    // Sized with no_init_t (no size_type, just explicit no_init)
    if (coreParams.some((p) => (p.typeInfo?.display ?? "").includes("no_init_t"))) {
        return "Sized (no-init)";
    }

    // Iterator range: two iterator params (detect by type or param names)
    if (
        allTypes.includes("InputIterator") ||
        allTypes.includes("Iterator") ||
        allTypes.includes("ForwardIterator") ||
        allTypes.includes("InputIt") ||
        allTypes.includes("_Iter") ||
        coreParams.some((p) => p.name === "__first" || p.name === "__last" || p.name === "first" || p.name === "last")
    ) {
        return "From iterator range";
    }

    // Range constructor: detect _Range type or __range param name
    if (
        coreParams.some((p) => {
            const type = p.typeInfo?.display ?? "";
            return p.name === "__range" || p.name === "range" || type.includes("_Range") || type.includes("Range &&");
        })
    ) {
        return "From range";
    }

    // initializer_list in any param
    if (allTypes.includes("initializer_list")) {
        return "From initializer_list";
    }

    // Move with allocator: T&& + allocator (already handled by hasAlloc suffix)
    if (firstType.includes("&&") && !firstType.includes("const")) {
        if (isOtherPropertiesType(firstType)) {
            return "From matching properties (move)";
        }
        return "Move";
    }

    // Copy from other type with allocator
    if (firstType.includes("const") && firstType.includes("&")) {
        if (isOtherPropertiesType(firstType)) {
            return "From matching properties (copy)";
        }
        if (firstType.includes("OtherT") || firstType.includes("OtherAlloc") || firstType.includes("Other")) {
            return detectSourceType(firstType);
        }
        return "Copy";
    }

    // Empty constructor: only infrastructure params (stream_ref, resource, env)
    // with no data payload (no size, no iterators, no range, no init_list)
    const hasStreamRef = coreParams.some((p) => (p.typeInfo?.display ?? "").includes("stream_ref"));
    const hasDataPayload = coreParams.some((p) => {
        const type = p.typeInfo?.display ?? "";
        const name = p.name ?? "";
        return (
            type.includes("size_type") ||
            type.includes("size_t") ||
            type.includes("no_init_t") ||
            type.includes("default_init_t") ||
            type.includes("initializer_list") ||
            type.includes("_Iter") ||
            type.includes("_Range") ||
            type.includes("Iterator") ||
            name === "__first" ||
            name === "__last" ||
            name === "__range" ||
            name === "n" ||
            name === "count"
        );
    });
    if (hasStreamRef && !hasDataPayload) {
        return "Empty";
    }

    return undefined;
}

/**
 * Detect the source type from a parameter type for "From X" tab titles.
 * E.g., "const std::vector<OtherT, OtherAlloc> &" -> "From std::vector"
 *        "const device_vector<OtherT, OtherAlloc> &" -> "From other device_vector type"
 *        "const detail::vector_base<OtherT, OtherAlloc> &" -> "From vector_base"
 */
function detectSourceType(paramType: string): string {
    // Strip const, &, and template args to get the base type
    const stripped = paramType
        .replace(/^const\s+/, "")
        .replace(/\s*&+$/, "")
        .replace(/<.*>/, "")
        .trim();
    if (stripped.includes("std::vector")) {
        return "From std::vector";
    }
    if (stripped.includes("vector_base")) {
        return "From vector_base";
    }
    // Generic "OtherPointer" or "OtherX" patterns -> "From other pointer" / "From other X"
    const shortName = stripped.split("::").pop() ?? stripped;
    if (shortName.startsWith("Other")) {
        // "OtherPointer" -> "pointer", "OtherElement" -> "element"
        const baseName = shortName.replace(/^Other/, "").toLowerCase();
        return `From other ${baseName}`;
    }
    // For same-family types with different template params (e.g., device_vector<OtherT>)
    if (shortName) {
        return `From other ${shortName} type`;
    }
    return "Copy";
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
    return (
        func.parameters.some((p) => {
            // Check arraySuffix field (most reliable)
            if (p.arraySuffix && p.arraySuffix.includes("ITEMS_PER_THREAD")) {
                return true;
            }
            const typeDisplay = p.typeInfo?.display ?? "";
            return typeDisplay.includes("[ITEMS_PER_THREAD]") || /\(\s*&\s*\)\s*\[/.test(typeDisplay);
        }) || func.templateParams.some((tp) => tp.name === "ITEMS_PER_THREAD")
    );
}

/**
 * Detect whether a function has a block_aggregate output parameter.
 */
function hasAggregateParam(func: CppFunctionIr): boolean {
    return func.parameters.some((p) => p.name === "block_aggregate");
}

/**
 * Detect whether a function has a prefix callback template parameter.
 */
function hasPrefixCallbackParam(func: CppFunctionIr): boolean {
    return (
        func.templateParams.some((tp) => {
            const name = tp.name ?? "";
            const type = tp.type ?? "";
            return (
                name.includes("PrefixCallbackOp") ||
                name.includes("BlockPrefixCallbackOp") ||
                type.includes("PrefixCallbackOp") ||
                type.includes("BlockPrefixCallbackOp")
            );
        }) ||
        func.parameters.some((p) => {
            const type = p.typeInfo?.display ?? "";
            return type.includes("PrefixCallbackOp") || type.includes("BlockPrefixCallbackOp");
        })
    );
}

/**
 * Detect whether a function has a num_valid / num_items parameter (partial tile).
 */
function hasPartialTileParam(func: CppFunctionIr): boolean {
    return func.parameters.some((p) => p.name === "num_valid" || p.name === "num_items");
}

/**
 * Detect whether a function has an initial_value parameter.
 */
function hasInitialValueParam(func: CppFunctionIr): boolean {
    return func.parameters.some((p) => p.name === "initial_value" || p.name === "init_value");
}

/**
 * Detect whether a function parameter is a range type (used in warp-level APIs
 * to distinguish "multiple items per thread" from "full warp" single-item overloads).
 * Range types use enable_if with is_fixed_size_random_access_range_v or similar.
 */
function hasRangeParam(func: CppFunctionIr): boolean {
    // Check template params for range-related enable_if constraints
    return func.templateParams.some((tp) => {
        const type = tp.type ?? "";
        return type.includes("random_access_range") || type.includes("is_range") || type.includes("InputType");
    });
}

/**
 * Generate tab titles for common C++ container methods (resize, insert, erase, assign)
 * based on parameter types and counts.
 */
function generateContainerMethodTabTitle(func: CppFunctionIr): string | undefined {
    const name = func.name;
    const params = func.parameters;
    const allTypes = params.map((p) => p.typeInfo?.display ?? "").join(", ");
    const allNames = params.map((p) => p.name ?? "").join(", ");

    if (name === "resize") {
        if (params.some((p) => (p.typeInfo?.display ?? "").includes("default_init_t"))) {
            return "Default-initialized";
        }
        if (params.some((p) => (p.typeInfo?.display ?? "").includes("no_init_t"))) {
            return "No-init";
        }
        if (params.length === 1) {
            return "Value-initialized";
        }
    }

    if (name === "insert") {
        if (
            allTypes.includes("InputIterator") ||
            allTypes.includes("Iterator") ||
            allTypes.includes("ForwardIterator") ||
            allTypes.includes("InputIt")
        ) {
            return "Range";
        }
        if (
            params.some((p) => p.name === "n" || p.name === "count") &&
            params.some((p) => p.name === "x" || p.name === "value" || p.name === "val")
        ) {
            return "Fill";
        }
        if (params.length <= 2) {
            return "Single element";
        }
    }

    if (name === "erase") {
        if (params.length >= 2 && (allNames.includes("first") || params.length === 2)) {
            return "Range";
        }
        if (params.length === 1) {
            return "Single element";
        }
    }

    if (name === "assign") {
        if (
            allTypes.includes("InputIterator") ||
            allTypes.includes("Iterator") ||
            allTypes.includes("ForwardIterator") ||
            allTypes.includes("InputIt")
        ) {
            return "Range";
        }
        if (params.some((p) => p.name === "n" || p.name === "count")) {
            return "Fill";
        }
    }

    return undefined;
}

/**
 * Generate a semantic tab title for a method overload based on its
 * parameters and template parameters relative to others in the group.
 *
 * Title patterns:
 * - "Full warp" / "Single item" — base overload with single T input
 * - "Multiple items per thread" — has ITEMS_PER_THREAD array params or range type
 * - "Partial warp" / "Partial tile" — has num_valid/valid_items parameter
 * - "With aggregate" — + block_aggregate param
 * - "With prefix callback" — + BlockPrefixCallbackOp template param
 * - "Mutable" / "Const" — const/non-const overload pairs
 * - "Copy assign" / "Move assign" — assignment operators
 * - "Pre-increment" / "Post-increment" — operator++/-- overloads
 * - "From X" — assignment from specific types
 */
function generateMethodTabTitle(func: CppFunctionIr, index: number): string {
    // Assignment operators: operator= (handle deleted + non-deleted)
    if (func.name === "operator=") {
        return generateAssignmentTabTitle(func, index);
    }

    // Check for deleted (after operator= which handles its own deleted case)
    if (isEffectivelyDeleted(func)) {
        return `Deleted overload`;
    }

    // Pre/Post increment/decrement: operator++, operator--
    if (func.name === "operator++" || func.name === "operator--") {
        return generateIncrementTabTitle(func);
    }

    const isMultiItem = hasArrayParams(func);
    const isRangeOverload = hasRangeParam(func);
    const hasAggregate = hasAggregateParam(func);
    const hasPrefixCb = hasPrefixCallbackParam(func);
    const isPartialTile = hasPartialTileParam(func);
    const hasValidItems = func.parameters.some((p) => p.name === "valid_items");
    const hasInitVal = hasInitialValueParam(func);

    // Build semantic title from detected traits.
    if (isMultiItem || isRangeOverload) {
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

    // Determine warp vs block level from function path
    const isWarpLevel = func.path.includes("Warp");

    if (isPartialTile || hasValidItems) {
        return isWarpLevel ? "Partial warp" : "Partial tile";
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

    // For simple single-item overloads (CUB block/warp patterns):
    // Use "Full warp" for warp-level, "Single item" for block-level
    const hasSimpleInput = func.parameters.some((p) => {
        const typeDisplay = p.typeInfo?.display ?? "";
        return (
            (p.name === "input" || p.name === "data") &&
            !typeDisplay.includes("[") &&
            !typeDisplay.includes("(&)") &&
            !(p.arraySuffix && p.arraySuffix.length > 0)
        );
    });
    if (hasSimpleInput) {
        return isWarpLevel ? "Full warp" : "Single item";
    }

    // Container method heuristics (resize, insert, erase, assign)
    const containerTitle = generateContainerMethodTabTitle(func);
    if (containerTitle) {
        return containerTitle;
    }

    // Execution policy detection (standalone functions, especially Thrust)
    const firstParamType = func.parameters[0]?.typeInfo?.display ?? "";
    if (firstParamType.includes("execution_policy")) {
        return "With execution policy";
    }

    // Const/Mutable differentiation: for method overload pairs, non-const is "Mutable"
    if (func.isConst) {
        return "Const";
    }

    // For non-const methods that are likely part of a const/non-const pair,
    // use "Mutable" (this will be overridden in renderOverloadedMethod if needed)
    // For now, fall through to summary-based title

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

/**
 * Generate tab titles for assignment operator (operator=) overloads.
 * Patterns: "Copy assign", "Move assign", "From X type", "From initializer_list"
 * For deleted overloads: "Copy assign (deleted)", "Move assign (deleted)"
 */
function generateAssignmentTabTitle(func: CppFunctionIr, index: number): string {
    const isDeleted = isEffectivelyDeleted(func);
    const deletedSuffix = isDeleted ? " (deleted)" : "";

    if (func.parameters.length === 0) {
        return isDeleted ? "Deleted overload" : `Overload ${index + 1}`;
    }

    const paramType = func.parameters[0]?.typeInfo?.display ?? "";

    // From nullptr
    if (paramType.includes("nullptr_t")) {
        return `From nullptr${deletedSuffix}`;
    }

    // Move assign: T&& param
    if (paramType.includes("&&") && !paramType.includes("const")) {
        return `Move assign${deletedSuffix}`;
    }

    // From other pointer/type: non-const, non-ref param (like OtherPointer)
    if (paramType.includes("Other") && !paramType.includes("const") && !paramType.includes("&")) {
        return `${detectSourceType("const " + paramType + " &")}${deletedSuffix}`;
    }

    // Copy assign: const T& (same type)
    if (paramType.includes("const") && paramType.includes("&")) {
        // Check for cross-type or named-type assignment via detectSourceType
        if (
            paramType.includes("OtherT") ||
            paramType.includes("OtherAlloc") ||
            paramType.includes("Other") ||
            paramType.includes("std::vector") ||
            paramType.includes("vector_base")
        ) {
            return detectSourceType(paramType) + deletedSuffix;
        }
        return `Copy assign${deletedSuffix}`;
    }

    // initializer_list
    if (paramType.includes("initializer_list")) {
        return `From initializer_list${deletedSuffix}`;
    }

    if (isDeleted) {
        return "Deleted overload";
    }

    // Use summary as fallback
    if (func.docstring?.summary && func.docstring.summary.length > 0) {
        const summary = renderSegmentsTrimmed(func.docstring.summary);
        const title = trimToNounPhrase(summary, 50);
        if (title) {
            return title;
        }
    }

    return `Overload ${index + 1}`;
}

/**
 * Generate tab titles for increment/decrement operators (operator++, operator--).
 * The C++ convention: no params = prefix (pre-), int param = postfix (post-).
 */
function generateIncrementTabTitle(func: CppFunctionIr): string {
    const isIncrement = func.name === "operator++";
    const op = isIncrement ? "increment" : "decrement";

    // Postfix: has a dummy int parameter
    const hasIntParam = func.parameters.some((p) => (p.typeInfo?.display ?? "").trim() === "int");

    if (hasIntParam) {
        return `Post-${op}`;
    }
    return `Pre-${op}`;
}

// ---------------------------------------------------------------------------
// Tab title deduplication
// ---------------------------------------------------------------------------

/**
 * Humanize a C++ parameter name for display in tab title suffixes.
 * Strips leading `d_` prefix (device pointer convention), replaces underscores
 * with spaces, and trims whitespace.
 *
 * Examples: "block_prefix" -> "block prefix", "d_temp_storage" -> "temp storage"
 */
function humanizeParamName(name: string): string {
    return name.replace(/^d_/, "").replace(/_/g, " ").trim();
}

/**
 * Post-hoc deduplication of tab titles for method overloads.
 *
 * Given an array of { title, func } entries (one per overload), returns an
 * array of unique title strings with the same length and order.
 *
 * Deduplication strategy (applied per group of entries sharing the same title):
 * 1. Differential named params — find params present in some overloads but not
 *    all within the duplicate group. Append "(with X and Y)" using humanized
 *    param names. Only overloads that have the differential params get the
 *    suffix; if only one overload lacks them, it keeps the base title.
 * 2. Param count suffix — if differential params still leave duplicates,
 *    append "(N params)".
 * 3. Numbered fallback — last resort, append "(1)", "(2)", etc.
 */
function deduplicateTabTitles(entries: ReadonlyArray<{ title: string; func: CppFunctionIr }>): string[] {
    const titles = entries.map((e) => e.title);

    // Collect indices that share the same title
    const groupsByTitle = new Map<string, number[]>();
    for (let i = 0; i < titles.length; i++) {
        const key = titles[i] ?? "";
        const group = groupsByTitle.get(key);
        if (group) {
            group.push(i);
        } else {
            groupsByTitle.set(key, [i]);
        }
    }

    for (const indices of groupsByTitle.values()) {
        if (indices.length < 2) {
            continue;
        }

        // Step 1: Try differential named params
        const paramSets = indices.map(
            (idx) => new Set(entries[idx]?.func.parameters.map((p) => p.name).filter((n) => n !== ""))
        );
        // Union of all param names in the group
        const allNames = new Set<string>();
        for (const s of paramSets) {
            for (const n of s) {
                allNames.add(n);
            }
        }
        // Differential params: names that appear in some but not all overloads
        const differentialNames = [...allNames].filter(
            (name) => paramSets.some((s) => s.has(name)) && paramSets.some((s) => !s.has(name))
        );

        if (differentialNames.length > 0) {
            for (let j = 0; j < indices.length; j++) {
                const idx = indices[j];
                const funcParams = paramSets[j];
                if (idx == null || funcParams == null) {
                    continue;
                }
                const uniqueParams = differentialNames.filter((name) => funcParams.has(name));
                if (uniqueParams.length > 0) {
                    const humanized = uniqueParams.map(humanizeParamName).join(" and ");
                    titles[idx] = `${titles[idx]} (with ${humanized})`;
                }
            }
        }

        // Check if titles are now unique; if not, apply step 2
        const stillDuplicateGroups = new Map<string, number[]>();
        for (const idx of indices) {
            const key = titles[idx] ?? "";
            const group = stillDuplicateGroups.get(key);
            if (group) {
                group.push(idx);
            } else {
                stillDuplicateGroups.set(key, [idx]);
            }
        }

        for (const dupIndices of stillDuplicateGroups.values()) {
            if (dupIndices.length < 2) {
                continue;
            }

            // Step 2: Param count suffix
            const countsAreUnique =
                new Set(dupIndices.map((idx) => entries[idx]?.func.parameters.length)).size === dupIndices.length;
            if (countsAreUnique) {
                for (const idx of dupIndices) {
                    const count = entries[idx]?.func.parameters.length;
                    titles[idx] = `${titles[idx]} (${count} params)`;
                }
                continue;
            }

            // Step 3: Numbered fallback
            let counter = 1;
            for (const idx of dupIndices) {
                titles[idx] = `${titles[idx]} (${counter})`;
                counter++;
            }
        }
    }

    return titles;
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
 * 5. Callouts (deprecated, notes, warnings, postconditions, preconditions)
 * 6. Returns
 * 7. Throws
 * 8. Template parameters
 * 9. Parameters
 * 10. Examples
 * 11. See also
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

    // 2. Signature CodeBlock (immediately after title/tabs)
    lines.push(renderSignatureCodeBlock(func, ownerClass, ctx));
    lines.push("");

    // 3. Description (summary + description blocks)
    renderMethodDescription(func, lines);

    // 4. Callouts (deprecated, notes, warnings, postconditions, preconditions)
    renderMethodCallouts(docstring, lines);

    // 5-8. Returns, Throws, Template parameters, Parameters
    renderMethodParamsSection(func, docstring, lines);

    // 9-10. Examples and See also
    renderMethodExamples(docstring, lines);

    // Trim trailing blank lines
    trimTrailingBlankLines(lines);

    return lines.join("\n");
}

/**
 * Render the description portion of a method: summary text and description blocks.
 * Appends to the provided lines array.
 */
function renderMethodDescription(func: CppFunctionIr, lines: string[]): void {
    const docstring = func.docstring;
    const descParts: string[] = [];
    if (docstring) {
        // Summary from structured docstring fields
        if (docstring.summary.length > 0) {
            const summary = renderSegmentsTrimmed(docstring.summary);
            if (summary) {
                descParts.push(summary);
            }
        }
        // Description blocks
        if (docstring.description.length > 0) {
            const desc = renderDescriptionBlocksDeduped(docstring.description, docstring.summary);
            if (desc) {
                descParts.push(desc);
            }
        }
    }
    if (descParts.length > 0) {
        lines.push(descParts.join("\n\n"));
        lines.push("");
    }
}

/**
 * Render callout sections for a method: deprecated, notes, warnings,
 * postconditions, and preconditions.
 * Appends to the provided lines array.
 */
function renderMethodCallouts(docstring: CppDocstringIr | undefined, lines: string[]): void {
    // Deprecated
    if (docstring?.deprecated) {
        const depText = renderSegmentsTrimmed(docstring.deprecated);
        if (depText) {
            lines.push(...renderCallout("Error", depText, "Deprecated"));
        }
    }

    // Notes render before Warnings
    if (docstring?.notes) {
        for (const note of docstring.notes) {
            const text = renderSegmentsTrimmed(note);
            if (text) {
                lines.push(...renderCallout("Note", text));
            }
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

    // Postconditions
    if (docstring?.postconditions) {
        for (const pc of docstring.postconditions) {
            const text = renderSegmentsTrimmed(pc);
            if (text) {
                lines.push(...renderCallout("Info", text, "Postconditions"));
            }
        }
    }

    // Preconditions
    if (docstring?.preconditions) {
        for (const pc of docstring.preconditions) {
            const text = renderSegmentsTrimmed(pc);
            if (text) {
                lines.push(...renderCallout("Info", text, "Preconditions"));
            }
        }
    }
}

/**
 * Render the returns, throws, template parameters, and parameters sections.
 * Appends to the provided lines array.
 */
function renderMethodParamsSection(func: CppFunctionIr, docstring: CppDocstringIr | undefined, lines: string[]): void {
    // Returns
    if (docstring?.returns) {
        const returnsText = renderSegmentsTrimmed(docstring.returns);
        if (returnsText) {
            lines.push(`**Returns:** ${returnsText}`);
            lines.push("");
        }
    }

    // Throws / Raises
    if (docstring?.raises && docstring.raises.length > 0) {
        for (const r of docstring.raises) {
            const desc = renderSegmentsTrimmed(r.description);
            if (desc) {
                lines.push(`**Throws:** ${r.exception ? `\`${r.exception}\` ` : ""}${desc}`);
                lines.push("");
            }
        }
    }

    // Template parameters
    const tplParams = renderMethodTemplateParams(func, docstring);
    if (tplParams) {
        lines.push(tplParams);
        lines.push("");
    }

    // Parameters
    const params = renderMethodParams(func, docstring);
    if (params) {
        lines.push(params);
        lines.push("");
    }
}

/**
 * Render the examples and see-also sections of a method.
 * Appends to the provided lines array.
 */
function renderMethodExamples(docstring: CppDocstringIr | undefined, lines: string[]): void {
    // Examples from structured docstring fields
    if (docstring?.examples && docstring.examples.length > 0) {
        for (const example of docstring.examples) {
            lines.push("**Example**");
            lines.push("");
            const lang = example.language || "cpp";
            lines.push(renderBareCodeBlock(example.code, lang));
            lines.push("");
        }
    }

    // See also (multi-line format)
    if (docstring?.seeAlso && docstring.seeAlso.length > 0) {
        const seeAlsoBlock = renderSeeAlso(docstring.seeAlso);
        if (seeAlsoBlock) {
            lines.push(seeAlsoBlock);
        }
    }
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
    ctx: RenderContext,
    options?: { skipHeading?: boolean }
): string {
    if (options?.skipHeading) {
        return renderMethodContent(func, ownerClass, ctx);
    }

    const lines: string[] = [];
    const displayName = escapeMdxText(func.name);

    lines.push(`### ${displayName} [#${methodAnchorId(func.name)}]`);
    lines.push("");

    const content = renderMethodContent(func, ownerClass, ctx);
    lines.push(content);

    return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Constructor overload sorting
// ---------------------------------------------------------------------------

/**
 * Check if a constructor is a move constructor (takes T&& as first core param).
 */
function isMoveConstructor(func: CppFunctionIr): boolean {
    const hasAlloc = lastParamIsAllocator(func);
    const coreParams = hasAlloc ? func.parameters.slice(0, -1) : func.parameters;
    if (coreParams.length !== 1) {
        return false;
    }
    const ft = coreParams[0]?.typeInfo?.display ?? "";
    return ft.includes("&&") && !ft.includes("const");
}

/**
 * Check if a constructor is a cross-type copy constructor.
 * This means it takes a const ref to a variant of the class with different
 * template parameters (OtherT, OtherAlloc), or from a related type
 * (std::vector, vector_base).
 */
function isCrossTypeCopyConstructor(func: CppFunctionIr): boolean {
    const hasAlloc = lastParamIsAllocator(func);
    const coreParams = hasAlloc ? func.parameters.slice(0, -1) : func.parameters;
    if (coreParams.length !== 1) {
        return false;
    }
    const ft = coreParams[0]?.typeInfo?.display ?? "";
    // Must be a const ref (not rvalue ref)
    if (!ft.includes("const") || !ft.includes("&") || ft.includes("&&")) {
        return false;
    }
    // Must reference a cross-type variant
    return (
        ft.includes("OtherT") || ft.includes("OtherAlloc") || ft.includes("std::vector") || ft.includes("vector_base")
    );
}

/**
 * Reorder constructor overloads so that cross-type copies come before moves.
 *
 * The IR often places constructors in this order:
 *   ..., same-type copy, move, move+alloc, cross-type copy, ...
 * The expected order is:
 *   ..., same-type copy, cross-type copy, move, move+alloc, ...
 *
 * This function does a targeted swap: it finds consecutive move constructors
 * followed by consecutive cross-type copies, and swaps those two groups.
 * Everything else stays in IR order.
 *
 * Mutates the array in place.
 */
function sortConstructorOverloads(funcs: CppFunctionIr[]): void {
    // Find the first move constructor
    let moveStart = -1;
    for (let i = 0; i < funcs.length; i++) {
        const func = funcs[i];
        if (func != null && isMoveConstructor(func)) {
            moveStart = i;
            break;
        }
    }
    if (moveStart < 0) {
        return; // No move constructors, nothing to reorder
    }

    // Find the end of the move group (consecutive move constructors, including
    // move+allocator variants which have 2 params but first is &&)
    let moveEnd = moveStart;
    for (let i = moveStart; i < funcs.length; i++) {
        const f = funcs[i];
        if (f == null) {
            break;
        }
        const ft = f.parameters[0]?.typeInfo?.display ?? "";
        if (ft.includes("&&") && !ft.includes("const")) {
            moveEnd = i + 1;
        } else {
            break;
        }
    }

    // Check if cross-type copies immediately follow the move group
    let crossCopyStart = moveEnd;
    let crossCopyEnd = moveEnd;
    for (let i = moveEnd; i < funcs.length; i++) {
        const crossFunc = funcs[i];
        if (crossFunc != null && isCrossTypeCopyConstructor(crossFunc)) {
            crossCopyEnd = i + 1;
        } else {
            break;
        }
    }

    // Only swap if we found cross-type copies immediately after moves
    if (crossCopyEnd > crossCopyStart) {
        const moves = funcs.splice(moveStart, moveEnd - moveStart);
        // After splice, the cross-type copies have shifted to moveStart
        // Insert the moves after the cross-type copies
        const crossCopyCount = crossCopyEnd - crossCopyStart;
        funcs.splice(moveStart + crossCopyCount, 0, ...moves);
    }
}

// ---------------------------------------------------------------------------
// Overloaded method rendering (with Tabs)
// ---------------------------------------------------------------------------

/**
 * Render a group of overloaded methods under a single H3 heading with Tabs.
 *
 * When multiple overloads are deleted, they are combined into a single
 * "Deleted overloads" tab with all signatures in one CodeBlock.
 */
export function renderOverloadedMethod(
    funcs: CppFunctionIr[],
    ownerClass: CppClassIr | undefined,
    ctx: RenderContext,
    options: {
        isConstructor?: boolean;
        generateTabTitle?: (func: CppFunctionIr, index: number) => string;
        skipHeading?: boolean;
    } = {}
): string {
    if (funcs.length === 0) {
        return "";
    }
    if (funcs.length === 1 && funcs[0] != null) {
        return renderSingleMethod(funcs[0], ownerClass, ctx, { skipHeading: options.skipHeading });
    }

    // Separate deleted and non-deleted overloads
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
    if (nonDeletedFuncs.length === 1 && deletedFuncs.length === 0 && nonDeletedFuncs[0] != null) {
        return renderSingleMethod(nonDeletedFuncs[0], ownerClass, ctx, { skipHeading: options.skipHeading });
    }

    const lines: string[] = [];
    const displayName = escapeMdxText(funcs[0]?.name ?? "");
    const commonQuals = getCommonQualifiers(funcs);

    if (!options.skipHeading) {
        lines.push(`### ${displayName} [#${methodAnchorId(funcs[0]?.name ?? "")}]`);
        lines.push("");
    }
    lines.push("<Tabs>");

    const titleGenerator =
        options.generateTabTitle ?? (options.isConstructor ? generateConstructorTabTitle : generateMethodTabTitle);

    // Sort constructor overloads so cross-type copies come before moves.
    // The IR often has: same-type copy, move, cross-type copy — reorder so
    // cross-type copies come before moves.
    if (options.isConstructor) {
        sortConstructorOverloads(nonDeletedFuncs);
    }

    // Detect const/non-const pairs for Mutable/Const tab titles.
    // When overloads differ only in const qualification, use "Mutable" and "Const" titles.
    const isConstMutablePair =
        !options.isConstructor &&
        nonDeletedFuncs.length === 2 &&
        nonDeletedFuncs.some((f) => f.isConst) &&
        nonDeletedFuncs.some((f) => !f.isConst);

    // Sort const/mutable pairs so non-const (Mutable) comes first
    if (isConstMutablePair) {
        nonDeletedFuncs.sort((a, b) => (a.isConst ? 1 : 0) - (b.isConst ? 1 : 0));
    }

    // Generate all tab titles first, then deduplicate to eliminate duplicates
    const rawEntries = nonDeletedFuncs.map((func) => {
        const originalIndex = funcs.indexOf(func);
        const title = isConstMutablePair ? (func.isConst ? "Const" : "Mutable") : titleGenerator(func, originalIndex);
        return { title, func };
    });
    const deduplicatedTitles = deduplicateTabTitles(rawEntries);

    // Render non-deleted overloads as individual tabs
    for (let i = 0; i < nonDeletedFuncs.length; i++) {
        const func = nonDeletedFuncs[i];
        const tabTitle = deduplicatedTitles[i];
        if (func == null || tabTitle == null) {
            continue;
        }
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

    // Combine deleted overloads into a single "Deleted overloads" tab
    if (deletedFuncs.length > 1) {
        lines.push(`<Tab title="Deleted overloads">`);
        lines.push("");
        lines.push("The following overloads are deleted to prevent misuse:");
        lines.push("");

        // Build combined signature CodeBlock
        const links: Record<string, string> = {};
        if (ownerClass) {
            const ownerLinkPath = buildLinkPath(ownerClass.path);
            if (ownerLinkPath) {
                links[getShortName(ownerClass.path)] = ownerLinkPath;
            }
        }
        const signatures = deletedFuncs
            .map((f) => {
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
        const func = deletedFuncs[0];
        if (func == null) {
            return "";
        }
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
export function renderDestructor(func: CppFunctionIr, ownerClass: CppClassIr, ctx: RenderContext): string {
    const lines: string[] = [];
    const className = getShortName(ownerClass.path);
    lines.push("### Destructor [#destructor]");
    lines.push("");
    lines.push(`### ~${escapeMdxText(className)}`);
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
