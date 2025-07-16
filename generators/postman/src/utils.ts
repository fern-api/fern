export const ORIGIN_VARIABLE_NAME = "baseUrl";

export function getReferenceToVariable(variable: string): string {
    return `{{${variable}}}`;
}
