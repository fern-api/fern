import { z } from "zod";
import { MultipleBaseUrlsEnvironmentSchema } from "./MultipleBaseUrlEnvironmentSchema";
import { SingleBaseUrlEnvironmentSchema } from "./SingleBaseUrlEnvironmentSchema";

export const EnvironmentSchema: z.ZodUnion<
    readonly [
        z.ZodString,
        z.ZodObject<{ url: z.ZodString; docs: z.ZodOptional<z.ZodString> }, z.core.$strip>,
        z.ZodObject<{ urls: z.ZodRecord<z.ZodString, z.ZodString>; docs: z.ZodOptional<z.ZodString> }, z.core.$strip>
    ]
> = z.union([z.string(), SingleBaseUrlEnvironmentSchema, MultipleBaseUrlsEnvironmentSchema]);

export type EnvironmentSchema = z.infer<typeof EnvironmentSchema>;
