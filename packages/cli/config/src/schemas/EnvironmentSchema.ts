import { z } from "zod";
import { MultipleBaseUrlsEnvironmentSchema } from "./MultipleBaseUrlEnvironmentSchema";
import { SingleBaseUrlEnvironmentSchema } from "./SingleBaseUrlEnvironmentSchema";

export const EnvironmentSchema = z.union([
    z.string(),
    SingleBaseUrlEnvironmentSchema,
    MultipleBaseUrlsEnvironmentSchema
]);

export type EnvironmentSchema = z.infer<typeof EnvironmentSchema>;
