import { z } from "zod";
import { MultipleBaseUrlsEnvironmentSchema } from "./MultipleBaseUrlEnvironmentSchema.js";
import { SingleBaseUrlEnvironmentSchema } from "./SingleBaseUrlEnvironmentSchema.js";

export const EnvironmentSchema = z.union([
    z.string(),
    SingleBaseUrlEnvironmentSchema,
    MultipleBaseUrlsEnvironmentSchema
]);

export type EnvironmentSchema = z.infer<typeof EnvironmentSchema>;
