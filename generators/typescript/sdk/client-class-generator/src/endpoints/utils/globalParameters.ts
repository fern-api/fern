import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { ts } from "ts-morph";

import { GeneratedSdkClientClassImpl } from "../../GeneratedSdkClientClassImpl.js";
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

function createClientDefaultLiteral(value: string | boolean): ts.Expression {
    return typeof value === "boolean"
        ? value
            ? ts.factory.createTrue()
            : ts.factory.createFalse()
        : ts.factory.createStringLiteral(value);
}

/**
 * Reads the resolved value of a global parameter from the client options,
 * falling back to the client-side default when present:
 *
 *     this._options?.<name> ?? <clientDefault>
 */
export function getResolvedGlobalParameterValueExpression(
    param: FernIr.GlobalParameter,
    caseConverter: CaseConverter
): ts.Expression {
    const optionKey = getSdkOptionKeyForGlobalParameter(param, caseConverter);
    const optionAccess: ts.Expression = ts.factory.createPropertyAccessChain(
        ts.factory.createPropertyAccessChain(
            ts.factory.createThis(),
            undefined,
            GeneratedSdkClientClassImpl.OPTIONS_PRIVATE_MEMBER
        ),
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createIdentifier(optionKey)
    );

    const clientDefault = getClientDefaultValue(param.clientDefault);
    if (clientDefault == null) {
        return optionAccess;
    }

    return ts.factory.createBinaryExpression(
        optionAccess,
        ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
        createClientDefaultLiteral(clientDefault)
    );
}
