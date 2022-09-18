import { FilePath } from "@fern-api/core-utils";
import { z } from "zod";
import { BaseGeneratorInvocationSchema } from "./BaseGeneratorInvocationSchema";

export const DraftGeneratorInvocationSchema = BaseGeneratorInvocationSchema.extend({
    "publish-to-fern-registry": z.optional(z.boolean()),
    "output-directory": z.optional(z.string().transform(FilePath.of)),
});

export type DraftGeneratorInvocationSchema = z.infer<typeof DraftGeneratorInvocationSchema>;
