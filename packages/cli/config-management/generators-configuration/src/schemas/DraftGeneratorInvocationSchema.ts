import { FilePath } from "@fern-api/core-utils";
import { z } from "zod";
import { BaseGeneratorInvocationSchema } from "./BaseGeneratorInvocationSchema";

export const DraftGeneratorInvocationSchema = BaseGeneratorInvocationSchema.extend({
    "local-output": z.optional(z.string().transform(FilePath.of)),
});

export type DraftGeneratorInvocationSchema = z.infer<typeof DraftGeneratorInvocationSchema>;
