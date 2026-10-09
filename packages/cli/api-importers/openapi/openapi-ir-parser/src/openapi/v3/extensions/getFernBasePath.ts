import { PathParameter, PrimitiveSchemaValue, Schema } from "@fern-api/openapi-ir";
import { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

const PLACEHOLDER_REGEX = /\{([^}]+)\}/g;

export interface FernBasePathResult {
    basePath: string;
    pathParameters: PathParameter[];
    /**
     * When `true`, every OpenAPI path is expected to begin with the literal
     * base-path prefix; the importer strips that prefix and drops redundant
     * operation-level path-parameter declarations.
     */
    pathsIncludeBasePath: boolean;
}

/**
 * Reads `x-fern-base-path` from the root of the document. Supports both the
 * string shorthand (`/v1`) and the structured form:
 *
 *   x-fern-base-path:
 *     path: /{tenant}/{apiVersion}
 *     parameters:
 *       tenant: { type: string, docs: "..." }
 *       apiVersion: { default: v1beta }
 */
export function getFernBasePath(document: OpenAPIV3.Document): FernBasePathResult | undefined {
    const raw = getExtension<unknown>(document, FernOpenAPIExtension.BASE_PATH);
    if (raw == null) {
        return undefined;
    }
    if (typeof raw === "string") {
        if (!raw.startsWith("/")) {
            return undefined;
        }
        return { basePath: raw, pathParameters: [], pathsIncludeBasePath: false };
    }
    if (typeof raw !== "object" || Array.isArray(raw)) {
        return undefined;
    }
    const obj = raw as Record<string, unknown>;
    const path = obj["path"];
    if (typeof path !== "string" || !path.startsWith("/")) {
        return undefined;
    }

    const placeholders = extractPlaceholders(path);
    const rawParameters = obj["parameters"];
    const parametersMap: Record<string, unknown> =
        rawParameters != null && typeof rawParameters === "object" && !Array.isArray(rawParameters)
            ? (rawParameters as Record<string, unknown>)
            : {};

    const pathParameters: PathParameter[] = [];
    for (const name of placeholders) {
        const entry = parametersMap[name];
        const docs =
            typeof entry === "object" && entry != null && !Array.isArray(entry)
                ? typeof (entry as Record<string, unknown>)["docs"] === "string"
                    ? ((entry as Record<string, unknown>)["docs"] as string)
                    : undefined
                : undefined;
        const clientDefault =
            typeof entry === "object" && entry != null && !Array.isArray(entry)
                ? (entry as Record<string, unknown>)["default"]
                : undefined;
        pathParameters.push({
            name,
            schema: Schema.primitive({
                description: docs,
                availability: undefined,
                schema: PrimitiveSchemaValue.string({
                    default: undefined,
                    pattern: undefined,
                    format: undefined,
                    minLength: undefined,
                    maxLength: undefined
                }),
                generatedName: name,
                nameOverride: undefined,
                title: undefined,
                namespace: undefined,
                groupName: undefined
            }),
            description: docs,
            availability: undefined,
            source: undefined,
            variableReference: undefined,
            parameterNameOverride: undefined,
            clientDefault
        });
    }

    const pathsIncludeBasePath = obj["paths-include-base-path"] === true;
    return { basePath: path, pathParameters, pathsIncludeBasePath };
}

function extractPlaceholders(path: string): string[] {
    const result: string[] = [];
    const regex = new RegExp(PLACEHOLDER_REGEX.source, "g");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(path)) != null) {
        if (match[1] != null && !result.includes(match[1])) {
            result.push(match[1]);
        }
    }
    return result;
}

/**
 * When `paths-include-base-path: true` is set on `x-fern-base-path`, every
 * path in `openApi.paths` must start with the literal base-path prefix. This
 * helper strips that prefix from each path and removes any path-level or
 * operation-level path-parameter declarations that match a root-level
 * parameter, to avoid stutter.
 *
 * Returns a list of errors (paths that don't start with the prefix). On
 * success, mutates `openApi.paths` in place.
 */
export function stripBasePathFromPaths({
    openApi,
    basePath,
    rootPathParameterNames
}: {
    openApi: OpenAPIV3.Document | OpenAPIV3_1.Document;
    basePath: string;
    rootPathParameterNames: Set<string>;
}): string[] {
    if (openApi.paths == null) {
        return [];
    }
    const trimmedBasePath = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
    const errors: string[] = [];
    const newPaths: Record<string, OpenAPIV3.PathItemObject | undefined> = {};

    for (const [path, pathItem] of Object.entries(openApi.paths)) {
        if (pathItem == null) {
            newPaths[path] = pathItem;
            continue;
        }
        if (!path.startsWith(trimmedBasePath)) {
            errors.push(`Expected path '${path}' to start with base path '${trimmedBasePath}'`);
            newPaths[path] = pathItem;
            continue;
        }
        const stripped = path.slice(trimmedBasePath.length) || "/";
        const newPathItem: OpenAPIV3.PathItemObject = stripPathParametersFromPathItem({
            pathItem,
            rootPathParameterNames
        });
        newPaths[stripped] = newPathItem;
    }

    openApi.paths = newPaths;
    return errors;
}

function stripPathParametersFromPathItem({
    pathItem,
    rootPathParameterNames
}: {
    pathItem: OpenAPIV3.PathItemObject;
    rootPathParameterNames: Set<string>;
}): OpenAPIV3.PathItemObject {
    const result: OpenAPIV3.PathItemObject = { ...pathItem };
    if (Array.isArray(result.parameters)) {
        result.parameters = result.parameters.filter((p) => !isStrippablePathParameter(p, rootPathParameterNames));
    }
    const operationKeys: Array<"get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace"> = [
        "get",
        "put",
        "post",
        "delete",
        "options",
        "head",
        "patch",
        "trace"
    ];
    for (const opKey of operationKeys) {
        const op = result[opKey];
        if (op == null || !Array.isArray(op.parameters)) {
            continue;
        }
        result[opKey] = {
            ...op,
            parameters: op.parameters.filter((p) => !isStrippablePathParameter(p, rootPathParameterNames))
        };
    }
    return result;
}

function isStrippablePathParameter(
    parameter: OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject,
    rootPathParameterNames: Set<string>
): boolean {
    if ("$ref" in parameter) {
        return false;
    }
    return parameter.in === "path" && rootPathParameterNames.has(parameter.name);
}
