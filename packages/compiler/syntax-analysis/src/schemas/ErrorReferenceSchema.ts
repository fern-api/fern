import { z } from "zod";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const ErrorReferenceSchema = z.union([
    z.string(),
    z
        .strictObject({
            error: z.string(),
        })
        .merge(WithDocsSchema),
]);

export type ErrorReferenceSchema = z.infer<typeof ErrorReferenceSchema>;
