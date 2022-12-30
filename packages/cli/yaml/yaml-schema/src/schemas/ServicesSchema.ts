import { z } from "zod";
import { HttpServiceSchema } from "./HttpServiceSchema";

export const ServicesSchema = z.strictObject({
    http: z.optional(z.record(HttpServiceSchema)),
});

export type ServicesSchema = z.infer<typeof ServicesSchema>;
