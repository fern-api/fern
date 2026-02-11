import { camelCase, upperFirst } from "lodash-es";

export function pascalCase(str: string): Capitalize<string> {
    return upperFirst(camelCase(str));
}
