import z from "zod";
import { FernOpenAPIExtension } from "@fern-api/openapi-ir-parser";

const PathOverrides = z.object({
    [FernOpenAPIExtension.SDK_METHOD_NAME]: z.optional(z.string()),
    [FernOpenAPIExtension.SDK_GROUP_NAME]: z.optional(z.array(z.string()))
});
const Path = z.union([
    z.object({
        get: PathOverrides
    }),
    z.object({
        post: PathOverrides
    }),
    z.object({
        put: PathOverrides
    }),
    z.object({
        delete: PathOverrides
    }),
    z.object({
        patch: PathOverrides
    })
]);
const Schema = z.object({
    [FernOpenAPIExtension.TYPE_NAME]: z.optional(z.string()),
    [FernOpenAPIExtension.SDK_GROUP_NAME]: z.optional(z.array(z.string()))
});
export const Overrides = z.object({
    paths: z.record(Path),
    components: z.object({
        schemas: z.record(Schema)
    })
});
