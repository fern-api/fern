import { z } from "zod";
import { HeaderConfigSchema } from "./HeaderConfigSchema";

export const HeaderSchema: z.ZodUnion<
    readonly [
        z.ZodString,
        z.ZodObject<
            { name: z.ZodOptional<z.ZodString>; env: z.ZodOptional<z.ZodString>; docs: z.ZodOptional<z.ZodString> },
            z.core.$strip
        >
    ]
> = z.union([z.string(), HeaderConfigSchema]);

export type HeaderSchema = z.infer<typeof HeaderSchema>;
