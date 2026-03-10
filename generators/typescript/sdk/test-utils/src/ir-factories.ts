import { FernIr } from "@fern-fern/ir-sdk";

import { casingsGenerator, createNameAndWireValue } from "./casings.js";

/**
 * Creates a PathParameter IR object for use in tests.
 */
export function createPathParameter(
    name: string,
    location: FernIr.PathParameterLocation = "ENDPOINT"
): FernIr.PathParameter {
    return {
        name: casingsGenerator.generateName(name),
        valueType: FernIr.TypeReference.primitive({
            v1: "STRING",
            v2: undefined
        }),
        location,
        variable: undefined,
        v2Examples: undefined,
        docs: undefined,
        explode: undefined
    };
}

/**
 * Creates a QueryParameter IR object for use in tests.
 */
export function createQueryParameter(
    name: string,
    valueType: FernIr.TypeReference,
    opts?: { allowMultiple?: boolean; wireValue?: string }
): FernIr.QueryParameter {
    return {
        name: createNameAndWireValue(name, opts?.wireValue),
        valueType,
        allowMultiple: opts?.allowMultiple ?? false,
        v2Examples: undefined,
        docs: undefined,
        availability: undefined,
        explode: undefined
    };
}

/**
 * Creates an HttpHeader IR object for use in tests.
 */
export function createHttpHeader(
    name: string,
    valueType: FernIr.TypeReference,
    opts?: { wireValue?: string; env?: string }
): FernIr.HttpHeader {
    return {
        name: createNameAndWireValue(name, opts?.wireValue),
        valueType,
        env: opts?.env,
        v2Examples: undefined,
        docs: undefined,
        availability: undefined
    };
}
