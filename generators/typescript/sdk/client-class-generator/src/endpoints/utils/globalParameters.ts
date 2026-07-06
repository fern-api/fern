import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { FileContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";

import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl.js";
import { typeNeedsStringify } from "./generateHeaders.js";
import { getClientDefaultValue } from "./isLiteralHeader.js";

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
    location
}: {
    ir: FernIr.IntermediateRepresentation;
    endpoint: FernIr.HttpEndpoint;
    location: FernIr.GlobalParameterLocation;
}): FernIr.GlobalParameter[] {
    return getGlobalParameters(ir).filter(
        (param) => param.location === location && globalParameterAppliesToEndpoint(param, endpoint)
    );
}

function createClientDefaultLiteral(value: string | boolean, forWire: boolean): ts.Expression {
    if (typeof value === "boolean") {
        const booleanLiteral = value ? ts.factory.createTrue() : ts.factory.createFalse();
        if (!forWire) {
            return booleanLiteral;
        }
        // On the wire a boolean default is serialized to its string form, mirroring
        // the `<value>.toString()` fallback that declared header/query params emit.
        return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(booleanLiteral, ts.factory.createIdentifier("toString")),
            undefined,
            []
        );
    }
    return ts.factory.createStringLiteral(value);
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

function applyClientDefaultFallback(
    valueExpression: ts.Expression,
    param: FernIr.GlobalParameter,
    forWire: boolean
): ts.Expression {
    const clientDefault = getClientDefaultValue(param.clientDefault);
    if (clientDefault == null) {
        return valueExpression;
    }

    return ts.factory.createBinaryExpression(
        valueExpression,
        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
        createClientDefaultLiteral(clientDefault, forWire)
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
    return applyClientDefaultFallback(getGlobalParameterOptionAccessExpression(param, caseConverter), param, false);
}

/**
 * Like {@link getResolvedGlobalParameterValueExpression}, but formats the
 * resolved value to its wire representation for header/query locations —
 * mirroring the `context.type.stringify` handling that declared header and
 * query parameters receive (e.g. `date`/`datetime` serialize to ISO-8601
 * rather than being coerced by `String(new Date())`):
 *
 *     stringify(this._options?.<name>) ?? <clientDefault>
 */
export function getResolvedGlobalParameterValueExpressionForWire(
    param: FernIr.GlobalParameter,
    context: FileContext
): ts.Expression {
    let optionAccess = getGlobalParameterOptionAccessExpression(param, context.case);
    if (typeNeedsStringify(param.valueType, context)) {
        optionAccess = context.type.stringify(optionAccess, param.valueType, {
            includeNullCheckIfOptional: true
        });
    }
    return applyClientDefaultFallback(optionAccess, param, true);
}
