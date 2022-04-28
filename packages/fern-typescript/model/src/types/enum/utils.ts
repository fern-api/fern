import { EnumValue } from "@fern-api/api";
import { snakeCase, upperFirst } from "lodash";

export function getKeyForEnum({ value }: EnumValue): string {
    return snakeCase(value).split("_").map(upperFirst).join("");
}

export function getValueForEnum({ value }: EnumValue): string {
    return snakeCase(value).toUpperCase();
}
