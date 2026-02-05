import { OpenAPIV3 } from "openapi-types";
import { EndpointSelector, HttpMethod } from "./types";

export class EndpointMatcher {
    constructor(private selectors: EndpointSelector[]) {}

    public matches(path: string, method: HttpMethod): boolean {
        for (const selector of this.selectors) {
            if (this.pathMatches(path, selector.path)) {
                if (!selector.method || selector.method === method) {
                    return true;
                }
            }
        }
        return false;
    }

    private pathMatches(actualPath: string, selectorPath: string): boolean {
        if (actualPath === selectorPath) {
            return true;
        }

        const actualParts = actualPath.split("/").filter((p) => p.length > 0);
        const selectorParts = selectorPath.split("/").filter((p) => p.length > 0);

        if (actualParts.length !== selectorParts.length) {
            return false;
        }

        for (let i = 0; i < actualParts.length; i++) {
            const actualPart = actualParts[i];
            const selectorPart = selectorParts[i];

            if (!actualPart || !selectorPart) {
                return false;
            }

            const isActualParam = actualPart.startsWith("{") && actualPart.endsWith("}");
            const isSelectorParam = selectorPart.startsWith("{") && selectorPart.endsWith("}");

            if (isActualParam && isSelectorParam) {
                continue;
            }

            if (actualPart !== selectorPart) {
                return false;
            }
        }

        return true;
    }

    public getMatchingPaths(paths: OpenAPIV3.PathsObject): string[] {
        const matchingPaths: string[] = [];

        for (const [path, pathItem] of Object.entries(paths)) {
            if (!pathItem) {
                continue;
            }

            const methods: HttpMethod[] = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

            for (const method of methods) {
                if (pathItem[method] && this.matches(path, method)) {
                    if (!matchingPaths.includes(path)) {
                        matchingPaths.push(path);
                    }
                    break;
                }
            }
        }

        return matchingPaths;
    }
}
