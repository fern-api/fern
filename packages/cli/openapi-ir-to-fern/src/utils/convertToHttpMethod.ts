import { HttpMethod } from "@fern-api/openapi-ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";

export function convertToHttpMethod(httpMethod: HttpMethod): RawSchemas.HttpMethodSchema {
    return HttpMethod._visit<RawSchemas.HttpMethodSchema>(httpMethod, {
        get: () => RawSchemas.HttpMethodSchema.Enum.GET,
        post: () => RawSchemas.HttpMethodSchema.Enum.POST,
        put: () => RawSchemas.HttpMethodSchema.Enum.PUT,
        patch: () => RawSchemas.HttpMethodSchema.Enum.PATCH,
        delete: () => RawSchemas.HttpMethodSchema.Enum.DELETE,
        head: () => {
            throw new Error("HEAD is unsupported");
        },
        options: () => {
            throw new Error("HEAD is unsupported");
        },
        trace: () => {
            throw new Error("HEAD is unsupported");
        },
        _other: () => {
            throw new Error("Unkown http method is unsupported");
        }
    });
}
