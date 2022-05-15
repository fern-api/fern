import { EnumValue } from "@fern-api/api";
import { snakeCase, upperFirst } from "lodash";

export function getKeyForEnum({ name }: EnumValue): string {
    return snakeCase(name).split("_").map(upperFirst).join("");
}

export function getValueForEnum({ value }: EnumValue): string {
    return snakeCase(value).toUpperCase();
}
