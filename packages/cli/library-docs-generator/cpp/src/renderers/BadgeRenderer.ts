/**
 * Renders qualifier badges for C++ methods and member variables.
 *
 * Badge ordering follows the canonical order:
 * inline, static, constexpr, explicit, const, noexcept, nodiscard, virtual, final
 */

import type { CppFunctionIr, CppVariableIr } from "../../../src/types/CppLibraryDocsIr.js";
import { isEffectivelyDeleted } from "./shared.js";

/**
 * Canonical badge ordering.
 */
const BADGE_ORDER = [
    "inline",
    "static",
    "constexpr",
    "explicit",
    "const",
    "noexcept",
    "nodiscard",
    "virtual",
    "final"
] as const;

type BadgeName = (typeof BADGE_ORDER)[number];

/**
 * Render a single qualifier badge.
 */
export function renderBadge(qualifier: string): string {
    return `<Badge intent="note" minimal>${qualifier}</Badge>`;
}

/**
 * Render multiple badges in canonical order, space-separated.
 */
export function renderBadges(qualifiers: string[]): string {
    // Sort by canonical order
    const sorted = [...qualifiers].sort((a, b) => {
        const ia = BADGE_ORDER.indexOf(a as BadgeName);
        const ib = BADGE_ORDER.indexOf(b as BadgeName);
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
    return sorted.map(renderBadge).join(" ");
}

/**
 * Collect all qualifier badges for a function.
 */
export function getFunctionQualifiers(func: CppFunctionIr): string[] {
    const quals: string[] = [];
    if (func.isInline) {
        quals.push("inline");
    }
    if (func.isStatic) {
        quals.push("static");
    }
    if (func.isConstexpr) {
        quals.push("constexpr");
    }
    if (func.isExplicit) {
        quals.push("explicit");
    }
    if (func.isConst) {
        quals.push("const");
    }
    if (func.isNoexcept) {
        quals.push("noexcept");
    }
    if (func.isNoDiscard) {
        quals.push("nodiscard");
    }
    if (func.virtuality === "virtual" || func.virtuality === "pure-virtual") {
        quals.push("virtual");
    }
    return quals;
}

/**
 * Find qualifiers that are common to all non-deleted overloads.
 * These go on the H3 heading.
 *
 * Deleted overloads (= delete) typically have minimal qualifiers (e.g., not
 * inline) because they are declaration-only. Including them in the common set
 * would incorrectly suppress badges that apply to all real overloads. Badges
 * are computed from non-deleted overloads only.
 */
export function getCommonQualifiers(funcs: CppFunctionIr[]): string[] {
    if (funcs.length === 0) {
        return [];
    }
    if (funcs.length === 1) {
        const first = funcs[0];
        if (first == null) {
            return [];
        }
        return getFunctionQualifiers(first);
    }

    // Filter out deleted overloads for common qualifier computation
    const nonDeletedFuncs = funcs.filter((f) => !isEffectivelyDeleted(f));

    // If all overloads are deleted, fall back to the original set
    const activeFuncs = nonDeletedFuncs.length > 0 ? nonDeletedFuncs : funcs;

    const allSets = activeFuncs.map((f) => new Set(getFunctionQualifiers(f)));
    const common = BADGE_ORDER.filter((q) => allSets.every((s) => s.has(q)));
    return common as string[];
}

/**
 * Get qualifiers that are specific to an overload (not in the common set).
 */
export function getOverloadSpecificQualifiers(func: CppFunctionIr, commonQuals: string[]): string[] {
    const all = getFunctionQualifiers(func);
    const commonSet = new Set(commonQuals);
    return all.filter((q) => !commonSet.has(q));
}

/**
 * Render badge string for member variable qualifiers.
 */
export function getVariableBadges(variable: CppVariableIr): string[] {
    const quals: string[] = [];
    if (variable.isStatic) {
        quals.push("static");
    }
    if (variable.isConstexpr) {
        quals.push("constexpr");
    }
    return quals;
}
