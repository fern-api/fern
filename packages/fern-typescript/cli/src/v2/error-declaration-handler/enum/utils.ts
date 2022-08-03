import { EnumValue } from "@fern-fern/ir-model";
import snakeCase from "lodash-es/snakeCase";
import upperFirst from "lodash-es/upperFirst";

export function getKeyForEnum({ name }: EnumValue): string {
    return snakeCase(name).split("_").map(upperFirst).join("");
}

export function getValueForEnum({ value }: EnumValue): string {
    return snakeCase(value).toUpperCase();
}
