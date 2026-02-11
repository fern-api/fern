import { z } from "zod";

export const ClientConfig: z.ZodObject<
    {
        filename: z.ZodOptional<z.ZodString>;
        class_name: z.ZodOptional<z.ZodString>;
        exported_filename: z.ZodOptional<z.ZodString>;
        exported_class_name: z.ZodOptional<z.ZodString>;
    },
    "strip",
    z.ZodTypeAny,
    {
        filename?: string | undefined;
        class_name?: string | undefined;
        exported_filename?: string | undefined;
        exported_class_name?: string | undefined;
    },
    {
        filename?: string | undefined;
        class_name?: string | undefined;
        exported_filename?: string | undefined;
        exported_class_name?: string | undefined;
    }
> = z.object({
    filename: z.string().optional(),
    class_name: z.string().optional(),
    exported_filename: z.string().optional(),
    exported_class_name: z.string().optional()
});

export type ClientConfig = z.infer<typeof ClientConfig>;
