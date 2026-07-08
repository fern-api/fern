import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { createHttpEndpoint, createMockTypeContext } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import {
    getGlobalParametersForEndpoint,
    getResolvedGlobalParameterValueExpression,
    getResolvedGlobalParameterValueExpressionForWire,
    getSdkOptionKeyForGlobalParameter,
    globalParameterAppliesToEndpoint
} from "../endpoints/utils/globalParameters.js";

const caseConverter = new CaseConverter({
    generationLanguage: "typescript",
    keywords: undefined,
    smartCasing: true
});

const wireContext = {
    case: caseConverter,
    type: createMockTypeContext()
    // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal FileContext interface
} as any;

const dateTimeType = FernIr.TypeReference.primitive({ v1: "DATE_TIME", v2: undefined });
const booleanType = FernIr.TypeReference.primitive({ v1: "BOOLEAN", v2: undefined });

function createGlobalParameter(overrides: Partial<FernIr.GlobalParameter> & { id: string }): FernIr.GlobalParameter {
    return {
        id: overrides.id,
        name: overrides.name ?? overrides.id,
        location: overrides.location ?? FernIr.GlobalParameterLocation.Query,
        target: overrides.target ?? overrides.id,
        valueType: overrides.valueType ?? FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
        env: overrides.env,
        clientDefault: overrides.clientDefault,
        optional: overrides.optional,
        apply: overrides.apply,
        docs: overrides.docs
    };
}

function printExpression(expression: ts.Expression): string {
    const sourceFile = ts.createSourceFile("test.ts", "", ts.ScriptTarget.Latest);
    const printer = ts.createPrinter();
    return printer.printNode(ts.EmitHint.Unspecified, expression, sourceFile);
}

describe("getSdkOptionKeyForGlobalParameter", () => {
    it("camel-cases the SDK-facing name", () => {
        expect(getSdkOptionKeyForGlobalParameter(createGlobalParameter({ id: "x-custom-header" }), caseConverter)).toBe(
            "xCustomHeader"
        );
    });

    it("uses the parameter-name override carried on `name`", () => {
        const param = createGlobalParameter({
            id: "max-retries",
            name: { wireValue: "max-retries", name: "maxRetries" }
        });
        expect(getSdkOptionKeyForGlobalParameter(param, caseConverter)).toBe("maxRetries");
    });
});

describe("globalParameterAppliesToEndpoint", () => {
    // Applicability is resolved at IR-generation time, so the generator is a pure
    // membership check against the endpoint's resolved `globalParameters` set —
    // `apply` mode is no longer consulted here.
    it("applies when the parameter id is in the endpoint's resolved set", () => {
        const param = createGlobalParameter({ id: "currency" });
        expect(globalParameterAppliesToEndpoint(param, createHttpEndpoint({ globalParameters: ["currency"] }))).toBe(
            true
        );
    });

    it("does not apply when the parameter id is absent from the resolved set", () => {
        const param = createGlobalParameter({ id: "currency" });
        expect(globalParameterAppliesToEndpoint(param, createHttpEndpoint())).toBe(false);
        expect(globalParameterAppliesToEndpoint(param, createHttpEndpoint({ globalParameters: ["language"] }))).toBe(
            false
        );
    });
});

describe("getGlobalParametersForEndpoint", () => {
    it("filters by location and applicability", () => {
        const headerParam = createGlobalParameter({
            id: "x-custom-header",
            location: FernIr.GlobalParameterLocation.Header
        });
        const queryParam = createGlobalParameter({
            id: "language",
            location: FernIr.GlobalParameterLocation.Query
        });
        const excludedQueryParam = createGlobalParameter({
            id: "verbose",
            location: FernIr.GlobalParameterLocation.Query
        });
        const ir = {
            globalParameters: [headerParam, queryParam, excludedQueryParam]
        } as FernIr.IntermediateRepresentation;

        // The endpoint's resolved set includes the header and one query param, but not `verbose`.
        const endpoint = createHttpEndpoint({ globalParameters: ["x-custom-header", "language"] });
        expect(
            getGlobalParametersForEndpoint({ ir, endpoint, location: FernIr.GlobalParameterLocation.Header })
        ).toEqual([headerParam]);
        // `verbose` is excluded because it is not in the endpoint's resolved set.
        expect(
            getGlobalParametersForEndpoint({ ir, endpoint, location: FernIr.GlobalParameterLocation.Query })
        ).toEqual([queryParam]);
    });

    it("excludes globals not materialized as an option (reserved-name collision) when a context is given", () => {
        // A global whose SDK name collides with a built-in option is neither emitted as a
        // constructor option nor injected — otherwise it would read the built-in's value.
        const injected = createGlobalParameter({
            id: "language",
            location: FernIr.GlobalParameterLocation.Query
        });
        const collides = createGlobalParameter({
            id: "max-retries",
            name: { wireValue: "max-retries", name: "maxRetries" },
            location: FernIr.GlobalParameterLocation.Query
        });
        const ir = {
            globalParameters: [injected, collides]
        } as FernIr.IntermediateRepresentation;
        // Only `language` is materialized; `max-retries` collided and was dropped.
        const context = {
            baseClient: {
                getInjectableGlobalParameterIds: () => new Set<string>(["language"])
            }
            // biome-ignore lint/suspicious/noExplicitAny: test mock with minimal FileContext interface
        } as any;

        expect(
            getGlobalParametersForEndpoint({
                ir,
                endpoint: createHttpEndpoint({ globalParameters: ["language", "max-retries"] }),
                location: FernIr.GlobalParameterLocation.Query,
                context
            })
        ).toEqual([injected]);
    });
});

describe("getResolvedGlobalParameterValueExpression", () => {
    it("reads the option without a fallback when there is no client default", () => {
        const param = createGlobalParameter({ id: "language" });
        expect(printExpression(getResolvedGlobalParameterValueExpression(param, caseConverter))).toBe(
            "this._options?.language"
        );
    });

    it("falls back to the string client default", () => {
        const param = createGlobalParameter({ id: "currency", clientDefault: FernIr.Literal.string("USD") });
        expect(printExpression(getResolvedGlobalParameterValueExpression(param, caseConverter))).toBe(
            'this._options?.currency ?? "USD"'
        );
    });

    it("falls back to the boolean client default", () => {
        const param = createGlobalParameter({ id: "verbose", clientDefault: FernIr.Literal.boolean(false) });
        expect(printExpression(getResolvedGlobalParameterValueExpression(param, caseConverter))).toBe(
            "this._options?.verbose ?? false"
        );
    });
});

describe("getResolvedGlobalParameterValueExpressionForWire", () => {
    it("stringifies a datetime value to its wire representation", () => {
        // Declared date/datetime params serialize via context.type.stringify (ISO-8601);
        // globals must do the same instead of letting the fetcher coerce a raw Date.
        const param = createGlobalParameter({ id: "updated-since", valueType: dateTimeType });
        expect(printExpression(getResolvedGlobalParameterValueExpressionForWire(param, wireContext))).toBe(
            "(this._options?.updatedSince).toString()"
        );
    });

    it("does not stringify a plain string value", () => {
        const param = createGlobalParameter({ id: "language" });
        expect(printExpression(getResolvedGlobalParameterValueExpressionForWire(param, wireContext))).toBe(
            "this._options?.language"
        );
    });

    it("serializes a boolean global symmetrically on the wire when it has a default", () => {
        // The whole resolved value is stringified so the option value and the default
        // are treated identically (matching declared params), rather than only the default.
        const param = createGlobalParameter({
            id: "verbose",
            valueType: booleanType,
            clientDefault: FernIr.Literal.boolean(false)
        });
        expect(printExpression(getResolvedGlobalParameterValueExpressionForWire(param, wireContext))).toBe(
            "(this._options?.verbose ?? false).toString()"
        );
    });

    it("leaves a boolean global with no default as a raw value on the wire", () => {
        // Without a default the option may be undefined; wrapping in `.toString()` could
        // throw, so the raw value is emitted and the fetcher/query builder coerces it.
        const param = createGlobalParameter({ id: "verbose", valueType: booleanType });
        expect(printExpression(getResolvedGlobalParameterValueExpressionForWire(param, wireContext))).toBe(
            "this._options?.verbose"
        );
    });
});
