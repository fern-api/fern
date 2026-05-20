import { PathParameter, PrimitiveSchemaValue, Schema } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

const PLACEHOLDER_REGEX = /\{([^}]+)\}/g;

export interface FernBasePathResult {
    basePath: string;
    pathParameters: PathParameter[];
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
        return { basePath: raw, pathParameters: [] };
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
        const docs = typeof entry === "object" && entry != null && !Array.isArray(entry)
            ? typeof (entry as Record<string, unknown>)["docs"] === "string"
                ? ((entry as Record<string, unknown>)["docs"] as string)
                : undefined
            : undefined;
        const clientDefault = typeof entry === "object" && entry != null && !Array.isArray(entry)
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

    return { basePath: path, pathParameters };
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
