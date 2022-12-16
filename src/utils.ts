export const ORIGIN_VARIABLE_NAME = "origin";

export function getReferenceToVariable(variable: string): string {
    return `{{${variable}}}`;
}
