import z from "zod";
import { FernOpenAPIExtension } from "@fern-api/openapi-ir-parser";

const PathOverrides = z.object({
    [FernOpenAPIExtension.SDK_METHOD_NAME]: z.optional(z.string()),
    [FernOpenAPIExtension.SDK_GROUP_NAME]: z.optional(z.array(z.string()))
});
const Path = z.object({
    get: z.optional(PathOverrides),
    post: z.optional(PathOverrides),
    put: z.optional(PathOverrides),
    delete: z.optional(PathOverrides),
    patch: z.optional(PathOverrides)
});
export const Overrides = z.object({
    paths: z.record(Path)
});
