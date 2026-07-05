import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { createHttpEndpoint } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";

import {
    getGlobalParametersForEndpoint,
    getResolvedGlobalParameterValueExpression,
    getSdkOptionKeyForGlobalParameter,
    globalParameterAppliesToEndpoint
} from "../endpoints/utils/globalParameters.js";

const caseConverter = new CaseConverter({
    generationLanguage: "typescript",
    keywords: undefined,
    smartCasing: true
});

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
    it("applies auto parameters to every endpoint", () => {
        const param = createGlobalParameter({ id: "currency", apply: FernIr.GlobalParameterApplyMode.Auto });
        expect(globalParameterAppliesToEndpoint(param, createHttpEndpoint())).toBe(true);
    });

    it("applies explicit parameters only when the endpoint opts in", () => {
        const param = createGlobalParameter({ id: "currency", apply: FernIr.GlobalParameterApplyMode.Explicit });
        expect(globalParameterAppliesToEndpoint(param, createHttpEndpoint())).toBe(false);
        expect(globalParameterAppliesToEndpoint(param, createHttpEndpoint({ globalParameters: ["currency"] }))).toBe(
            true
        );
    });

    it("defaults to explicit when apply is not specified", () => {
        const param = createGlobalParameter({ id: "currency" });
        expect(globalParameterAppliesToEndpoint(param, createHttpEndpoint())).toBe(false);
    });
});

describe("getGlobalParametersForEndpoint", () => {
    it("filters by location and applicability", () => {
        const headerParam = createGlobalParameter({
            id: "x-custom-header",
            location: FernIr.GlobalParameterLocation.Header,
            apply: FernIr.GlobalParameterApplyMode.Auto
        });
        const queryParam = createGlobalParameter({
            id: "language",
            location: FernIr.GlobalParameterLocation.Query,
            apply: FernIr.GlobalParameterApplyMode.Auto
        });
        const explicitQueryParam = createGlobalParameter({
            id: "verbose",
            location: FernIr.GlobalParameterLocation.Query,
            apply: FernIr.GlobalParameterApplyMode.Explicit
        });
        const ir = {
            globalParameters: [headerParam, queryParam, explicitQueryParam]
        } as FernIr.IntermediateRepresentation;

        const endpoint = createHttpEndpoint();
        expect(
            getGlobalParametersForEndpoint({ ir, endpoint, location: FernIr.GlobalParameterLocation.Header })
        ).toEqual([headerParam]);
        // The explicit query param is excluded because the endpoint did not opt in.
        expect(
            getGlobalParametersForEndpoint({ ir, endpoint, location: FernIr.GlobalParameterLocation.Query })
        ).toEqual([queryParam]);
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
