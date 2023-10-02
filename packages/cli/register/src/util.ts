import { capitalize, snakeCase } from "lodash-es";

export function titleCase(str: string): string {
    return snakeCase(str).split("_").map(capitalize).join(" ");
}
