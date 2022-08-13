import { StringWithAllCasings, WireStringWithAllCasings } from "@fern-fern/ir-model";
import { camelCase, snakeCase, upperFirst } from "lodash-es";

export function generateStringWithAllCasings(originalValue: string): StringWithAllCasings {
    const camelCaseValue = camelCase(originalValue);
    const snakeCaseValue = snakeCase(originalValue);
    return {
        originalValue,
        camelCase: camelCaseValue,
        snakeCase: snakeCaseValue,
        pascalCase: upperFirst(camelCaseValue),
        screamingSnakeCase: snakeCaseValue.toUpperCase(),
    };
}

export function generateWireStringWithAllCasings({
    wireValue,
    name,
}: {
    wireValue: string;
    name: string;
}): WireStringWithAllCasings {
    return {
        ...generateStringWithAllCasings(name),
        wireValue,
    };
}
