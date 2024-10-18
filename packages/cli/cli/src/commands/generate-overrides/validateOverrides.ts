import { HttpMethod } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";
import yaml from "js-yaml";
import { getOperationObjectsFromPathItem } from "./parseOpenApi";

export interface OpenAPIOverrides {
    paths: {
        [path: string]: {
            [method: string]: {
                "x-fern-sdk-method-name": string;
                "x-fern-sdk-group-name": string[];
            };
        };
    };
}

export function validateOverrides(
    overrides: string,
    parsedOpenApiSpec: OpenAPIV3.Document,
    action: "strip" = "strip"
): string {
    const parsedOverrides = yaml.load(overrides) as OpenAPIOverrides;
    const sanitizedOverrides: OpenAPIOverrides = { paths: {} };
    for (const [path, pathItem] of Object.entries(parsedOverrides.paths)) {
        if (pathItem == null) {
            continue;
        }
        if (path in parsedOpenApiSpec.paths && parsedOpenApiSpec.paths[path] != null) {
            const sourcePathItem = parsedOpenApiSpec.paths[path];
            if (sourcePathItem == null) {
                // Shouldn't happen with the above type guard
                continue;
            }
            const operations = getOperationObjectsFromPathItem(sourcePathItem);
            for (const [method, methodItem] of Object.entries(pathItem)) {
                if (operations.get(method.toUpperCase() as HttpMethod) != null) {
                    if (sanitizedOverrides.paths[path] == null) {
                        sanitizedOverrides.paths[path] = {};
                    }
                    sanitizedOverrides.paths[path]![method] = methodItem;
                }
            }
        }
    }

    return yaml.dump(sanitizedOverrides);
}
