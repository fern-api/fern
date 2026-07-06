import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl.js";
import { getClientDefaultValue } from "./isLiteralHeader.js";
import { typeNeedsStringify } from "./typeNeedsStringify.js";

/**
 * Helpers for consuming `ir.globalParameters` in the SDK generator.
 *
 * A global parameter is set once at the client level (a typed constructor
 * option) and injected into every relevant request at its declared wire
 * location. Per-call values always win over the global value, and the
 * client-side default is the final fallback:
 *
 *     per-call value  ??  this._options?.<name>  ??  <clientDefault>
 */

export function getGlobalParameters(ir: FernIr.IntermediateRepresentation): FernIr.GlobalParameter[] {
    return ir.globalParameters ?? [];
}

/**
 * The SDK-facing constructor option key for a global parameter. Uses the
 * `name` side of `NameAndWireValueOrString` (populated from `parameter-name`
 * when provided), camel-cased for TypeScript.
 */
export function getSdkOptionKeyForGlobalParameter(param: FernIr.GlobalParameter, caseConverter: CaseConverter): string {
    return caseConverter.camelUnsafe(param.name);
}

/**
 * Whether a global parameter is injected into the given endpoint. `auto`
 * applies to every operation; `explicit` (the default) applies only to
 * operations that opted in via `x-fern-global-parameter`.
 */
export function globalParameterAppliesToEndpoint(
    param: FernIr.GlobalParameter,
    endpoint: FernIr.HttpEndpoint
): boolean {
    const apply = param.apply ?? FernIr.GlobalParameterApplyMode.Explicit;
    return FernIr.GlobalParameterApplyMode._visit<boolean>(apply, {
        auto: () => true,
        explicit: () => (endpoint.globalParameters ?? []).includes(param.id),
        _other: () => false
    });
}

export function getGlobalParametersForEndpoint({
    ir,
    endpoint,
    location,
    context
}: {
    ir: FernIr.IntermediateRepresentation;
    endpoint: FernIr.HttpEndpoint;
    location: FernIr.GlobalParameterLocation;
    /**
     * When provided, results are filtered to global parameters that are actually
     * materialized as a client constructor option. A global whose SDK name
     * collides with a reserved/declared option is not emitted as an option, so it
     * must not be injected either (otherwise it would read the built-in option's
     * value). Omit only in isolated unit tests that don't exercise collisions.
     */
    context?: FileContext;
}): FernIr.GlobalParameter[] {
    const candidates = getGlobalParameters(ir).filter(
        (param) => param.location === location && globalParameterAppliesToEndpoint(param, endpoint)
    );
    if (candidates.length === 0 || context == null) {
        return candidates;
    }
    const injectableIds = context.baseClient.getInjectableGlobalParameterIds(context);
    return candidates.filter((param) => injectableIds.has(param.id));
}

function createClientDefaultLiteral(value: string | boolean): ts.Expression {
    if (typeof value === "boolean") {
        return value ? ts.factory.createTrue() : ts.factory.createFalse();
    }
    return ts.factory.createStringLiteral(value);
}

function createToStringCall(expression: ts.Expression): ts.Expression {
    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(expression, ts.factory.createIdentifier("toString")),
        undefined,
        []
    );
}

function isBooleanValueType(type: FernIr.TypeReference): boolean {
    if (type.type === "container") {
        if (type.container.type === "optional") {
            return isBooleanValueType(type.container.optional);
        }
        if (type.container.type === "nullable") {
            return isBooleanValueType(type.container.nullable);
        }
        return false;
    }
    return type.type === "primitive" && type.primitive.v1 === "BOOLEAN";
}

function getGlobalParameterOptionAccessExpression(
    param: FernIr.GlobalParameter,
    caseConverter: CaseConverter
): ts.Expression {
    const optionKey = getSdkOptionKeyForGlobalParameter(param, caseConverter);
    return ts.factory.createPropertyAccessChain(
        ts.factory.createPropertyAccessChain(
            ts.factory.createThis(),
            undefined,
            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
        ),
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createIdentifier(optionKey)
    );
}

function applyClientDefaultFallback(valueExpression: ts.Expression, param: FernIr.GlobalParameter): ts.Expression {
    const clientDefault = getClientDefaultValue(param.clientDefault);
    if (clientDefault == null) {
        return valueExpression;
    }

    return ts.factory.createBinaryExpression(
        valueExpression,
        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
        createClientDefaultLiteral(clientDefault)
    );
}

/**
 * Reads the resolved value of a global parameter from the client options,
 * falling back to the client-side default when present:
 *
 *     this._options?.<name> ?? <clientDefault>
 *
 * The value is returned in its declared TypeScript type (not stringified), so
 * this is used for body injection where the value is serialized as-is. Header
 * and query locations must use {@link getResolvedGlobalParameterValueExpressionForWire}
 * so date/datetime values are formatted to their wire representation.
 */
export function getResolvedGlobalParameterValueExpression(
    param: FernIr.GlobalParameter,
    caseConverter: CaseConverter
): ts.Expression {
    return applyClientDefaultFallback(getGlobalParameterOptionAccessExpression(param, caseConverter), param);
}

/**
 * Like {@link getResolvedGlobalParameterValueExpression}, but formats the
 * resolved value to its wire representation for header/query locations —
 * mirroring the `context.type.stringify` handling that declared header and
 * query parameters receive (e.g. `date`/`datetime` serialize to ISO-8601
 * rather than being coerced by `String(new Date())`):
 *
 *     stringify(this._options?.<name>) ?? <clientDefault>
 *
 * Booleans are handled symmetrically: the whole resolved value is stringified
 * (`(this._options?.<name> ?? <default>).toString()`) so the option value and
 * the default are treated identically, matching declared params. A bare boolean
 * option with no default is left as-is (the fetcher/query builder coerces it).
 */
export function getResolvedGlobalParameterValueExpressionForWire(
    param: FernIr.GlobalParameter,
    context: FileContext
): ts.Expression {
    if (isBooleanValueType(param.valueType)) {
        const resolved = applyClientDefaultFallback(
            getGlobalParameterOptionAccessExpression(param, context.case),
            param
        );
        // Only wrap in `.toString()` when a default guarantees the value is a
        // non-null boolean; otherwise `undefined.toString()` could throw.
        return getClientDefaultValue(param.clientDefault) != null ? createToStringCall(resolved) : resolved;
    }

    let optionAccess = getGlobalParameterOptionAccessExpression(param, context.case);
    if (typeNeedsStringify(param.valueType, context)) {
        optionAccess = context.type.stringify(optionAccess, param.valueType, {
            includeNullCheckIfOptional: true
        });
    }
    return applyClientDefaultFallback(optionAccess, param);
}
