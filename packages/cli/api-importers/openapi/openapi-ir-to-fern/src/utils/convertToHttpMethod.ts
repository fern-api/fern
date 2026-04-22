import { RawSchemas } from "@fern-api/fern-definition-schema";
import { HttpMethod } from "@fern-api/openapi-ir";
import { CliError } from "@fern-api/task-context";

export function convertToHttpMethod(httpMethod: HttpMethod): RawSchemas.HttpMethodSchema {
    return HttpMethod._visit<RawSchemas.HttpMethodSchema>(httpMethod, {
        get: () => RawSchemas.HttpMethodSchema.Get,
        post: () => RawSchemas.HttpMethodSchema.Post,
        put: () => RawSchemas.HttpMethodSchema.Put,
        patch: () => RawSchemas.HttpMethodSchema.Patch,
        delete: () => RawSchemas.HttpMethodSchema.Delete,
        head: () => RawSchemas.HttpMethodSchema.Head,
        options: () => {
            throw new CliError({ message: "OPTIONS is unsupported", code: CliError.Code.ConfigError });
        },
        trace: () => {
            throw new CliError({ message: "TRACE is unsupported", code: CliError.Code.ConfigError });
        },
        _other: () => {
            throw new CliError({ message: "Unknown http method is unsupported", code: CliError.Code.ConfigError });
        }
    });
}
