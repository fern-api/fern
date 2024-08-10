/**
 *
 * @param selector a property selector like "$response.id" or "$request.name.last"
 * @returns the path of the selector ["id"] or ["name", "last"]
 */
export function getPathFromSelector(selector: string): string[] {
    return selector.split(".").slice(1);
}
