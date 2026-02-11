import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";

export const BaseSwiftCustomConfigSchema: z.ZodObject<
    {
        moduleName: z.ZodOptional<z.ZodString>;
        clientClassName: z.ZodOptional<z.ZodString>;
        environmentEnumName: z.ZodOptional<z.ZodString>;
        customReadmeSections: z.ZodOptional<
            z.ZodArray<
                z.ZodObject<
                    { title: z.ZodString; content: z.ZodString },
                    "strict",
                    z.ZodTypeAny,
                    { title: string; content: string },
                    { title: string; content: string }
                >,
                "many"
            >
        >;
        enableWireTests: z.ZodOptional<z.ZodBoolean>;
        nullableAsOptional: z.ZodOptional<z.ZodBoolean>;
    },
    "strip",
    z.ZodTypeAny,
    {
        customReadmeSections?: Array<{ title: string; content: string }> | undefined;
        moduleName?: string | undefined;
        clientClassName?: string | undefined;
        environmentEnumName?: string | undefined;
        enableWireTests?: boolean | undefined;
        nullableAsOptional?: boolean | undefined;
    },
    {
        customReadmeSections?: Array<{ title: string; content: string }> | undefined;
        moduleName?: string | undefined;
        clientClassName?: string | undefined;
        environmentEnumName?: string | undefined;
        enableWireTests?: boolean | undefined;
        nullableAsOptional?: boolean | undefined;
    }
> = z.object({
    moduleName: z.string().optional(),
    clientClassName: z.string().optional(),
    environmentEnumName: z.string().optional(),
    customReadmeSections: z.array(CustomReadmeSectionSchema).optional(),
    enableWireTests: z.boolean().optional(),
    nullableAsOptional: z.boolean().optional()
});

export type BaseSwiftCustomConfigSchema = z.infer<typeof BaseSwiftCustomConfigSchema>;
