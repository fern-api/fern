import { EnumValue } from "@fern-api/api";
import { capitalizeFirstLetter } from "@fern-api/typescript-commons";
import { snakeCase } from "lodash";

export function getKeyForEnum({ value }: EnumValue): string {
    return snakeCase(value).split("_").map(capitalizeFirstLetter).join("");
}

export function getValueForEnum({ value }: EnumValue): string {
    return snakeCase(value).toUpperCase();
}
