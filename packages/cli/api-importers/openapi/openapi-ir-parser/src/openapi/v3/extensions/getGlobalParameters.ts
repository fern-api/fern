import { GlobalParameter } from "@fern-api/openapi-ir";
import { OpenAPIV3 } from "openapi-types";

import { getExtension } from "../../../getExtension.js";
import { FernOpenAPIExtension } from "./fernExtensions.js";

interface GlobalParameterExtension {
    name: string;
    "parameter-name": string | undefined;
    in: string | undefined;
    target: string | undefined;
    type: string | undefined;
    env: string | undefined;
    default: unknown | undefined;
    "x-fern-default": unknown | undefined;
    optional: boolean | undefined;
    apply: string | undefined;
    docs: string | undefined;
}

function resolveDefault(entry: GlobalParameterExtension): unknown | undefined {
    return entry["x-fern-default"] ?? entry.default;
}

export function getGlobalParameters(document: OpenAPIV3.Document): GlobalParameter[] {
    const globalParameters = getExtension<GlobalParameterExtension[]>(
        document,
        FernOpenAPIExtension.FERN_GLOBAL_PARAMETERS
    );
    const result: GlobalParameter[] = [];
    for (const param of globalParameters ?? []) {
        if (typeof param.name !== "string") {
            continue;
        }
        result.push({
            name: param.name,
            parameterName: param["parameter-name"],
            in: param.in,
            target: param.target,
            type: param.type,
            env: param.env,
            default: resolveDefault(param),
            optional: param.optional,
            apply: param.apply,
            docs: param.docs
        });
    }
    return result;
}

export function getEndpointGlobalParameterIds(operation: OpenAPIV3.OperationObject): string[] | undefined {
    const extensionValue = getExtension<string | string[]>(operation, FernOpenAPIExtension.FERN_GLOBAL_PARAMETER);
    if (extensionValue == null) {
        return undefined;
    }
    if (typeof extensionValue === "string") {
        return [extensionValue];
    }
    if (Array.isArray(extensionValue)) {
        return extensionValue.filter((item): item is string => typeof item === "string");
    }
    return undefined;
}
