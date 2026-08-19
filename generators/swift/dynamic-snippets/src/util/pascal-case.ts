import { camelCase, upperFirst } from "lodash-es";

export function pascalCase(str: string): string {
    return upperFirst(camelCase(str));
}
