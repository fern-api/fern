import { z } from "zod";
import { MultipleBaseUrlsEnvironmentSchema } from "./MultipleBaseUrlsEnvironmentSchema";
import { SingleBaseUrlEnvironmentSchema } from "./SingleBaseUrlEnvironmentSchema";

export const EnvironmentSchema = z.union([
    z.string(),
    SingleBaseUrlEnvironmentSchema,
    MultipleBaseUrlsEnvironmentSchema
]);

export type EnvironmentSchema = z.infer<typeof EnvironmentSchema>;
