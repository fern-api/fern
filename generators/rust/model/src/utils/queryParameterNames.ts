import { getWireValue, NameInput } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";

/**
 * Minimal slice of the generator context needed to derive a Rust field
 * name from an IR name. Kept structural so both the model and SDK
 * generator contexts satisfy it.
 */
export interface QueryParameterNameContext {
    escapeRustKeyword: (name: string) => string;
    case: { snakeUnsafe: (name: NameInput) => string };
}

/**
 * Rust field name a query parameter maps to.
 */
export function getQueryParameterFieldName(
    queryParam: FernIr.QueryParameter,
    context: QueryParameterNameContext
): string {
    return context.escapeRustKeyword(context.case.snakeUnsafe(queryParam.name));
}

/**
 * Rewrite query parameter names so that no two parameters of the same
 * endpoint map to the same Rust field name.
 *
 * Distinct wire names can collapse to one identifier once
 * non-alphanumeric characters are dropped by snake-casing — Twilio's
 * `DateCreated`, `DateCreated<` and `DateCreated>` all become
 * `date_created`, which previously emitted a struct with three fields
 * of the same name and made the generated crate uncompilable.
 * Colliding parameters keep their wire value (so serialization is
 * unaffected) and get a `_2`, `_3`, ... suffix on the Rust side,
 * assigned in declaration order so every call site derives the same
 * name from the same endpoint.
 */
export function dedupeQueryParameterNames(
    queryParams: FernIr.QueryParameter[],
    context: QueryParameterNameContext
): FernIr.QueryParameter[] {
    const taken = new Set<string>();
    return queryParams.map((queryParam) => {
        const fieldName = getQueryParameterFieldName(queryParam, context);
        if (!taken.has(fieldName)) {
            taken.add(fieldName);
            return queryParam;
        }
        let suffix = 2;
        let candidate = `${fieldName}_${suffix}`;
        // The candidate is re-cased through the context because casing is not
        // idempotent here (`date_created_2` cases to `date_created2`), and the
        // name that must be unique is the one downstream code derives.
        let candidateFieldName = context.escapeRustKeyword(context.case.snakeUnsafe(candidate));
        while (taken.has(candidateFieldName)) {
            suffix += 1;
            candidate = `${fieldName}_${suffix}`;
            candidateFieldName = context.escapeRustKeyword(context.case.snakeUnsafe(candidate));
        }
        taken.add(candidateFieldName);
        return {
            ...queryParam,
            name: { name: candidate, wireValue: getWireValue(queryParam.name) }
        };
    });
}
