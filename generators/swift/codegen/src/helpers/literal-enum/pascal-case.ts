import { camelCase, upperFirst } from "lodash-es";

export function pascalCase(str: string) {
    return upperFirst(camelCase(str));
}
