import { RawSchemas } from "@fern-api/fern-definition-schema"
import { HttpMethod } from "@fern-api/openapi-ir"

export function convertToHttpMethod(httpMethod: HttpMethod): RawSchemas.HttpMethodSchema {
    return HttpMethod._visit<RawSchemas.HttpMethodSchema>(httpMethod, {
        get: () => RawSchemas.HttpMethodSchema.Get,
        post: () => RawSchemas.HttpMethodSchema.Post,
        put: () => RawSchemas.HttpMethodSchema.Put,
        patch: () => RawSchemas.HttpMethodSchema.Patch,
        delete: () => RawSchemas.HttpMethodSchema.Delete,
        head: () => RawSchemas.HttpMethodSchema.Head,
        options: () => {
            throw new Error("OPTIONS is unsupported")
        },
        trace: () => {
            throw new Error("TRACE is unsupported")
        },
        _other: () => {
            throw new Error("Unknown http method is unsupported")
        }
    })
}
