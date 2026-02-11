import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";

export const BasePhpCustomConfigSchema: z.ZodObject<
    {
        clientName: z.ZodOptional<z.ZodString>;
        inlinePathParameters: z.ZodOptional<z.ZodBoolean>;
        packageName: z.ZodOptional<z.ZodString>;
        packagePath: z.ZodOptional<z.ZodString>;
        propertyAccess: z.ZodOptional<z.ZodEnum<["public", "private"]>>;
        namespace: z.ZodOptional<z.ZodString>;
        composerJson: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
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
        "client-class-name": z.ZodOptional<z.ZodString>;
    },
    "strip",
    z.ZodTypeAny,
    {
        packagePath?: string | undefined;
        customReadmeSections?: Array<{ title: string; content: string }> | undefined;
        inlinePathParameters?: boolean | undefined;
        namespace?: string | undefined;
        clientName?: string | undefined;
        packageName?: string | undefined;
        propertyAccess?: "private" | "public" | undefined;
        composerJson?: Record<string, any> | undefined;
        "client-class-name"?: string | undefined;
    },
    {
        packagePath?: string | undefined;
        customReadmeSections?: Array<{ title: string; content: string }> | undefined;
        inlinePathParameters?: boolean | undefined;
        namespace?: string | undefined;
        clientName?: string | undefined;
        packageName?: string | undefined;
        propertyAccess?: "private" | "public" | undefined;
        composerJson?: Record<string, any> | undefined;
        "client-class-name"?: string | undefined;
    }
> = z.object({
    clientName: z.string().optional(),
    inlinePathParameters: z.boolean().optional(),
    packageName: z.string().optional(),
    packagePath: z.string().optional(),
    propertyAccess: z.enum(["public", "private"]).optional(),
    namespace: z.string().optional(),
    composerJson: z.optional(z.record(z.any())),
    customReadmeSections: z.array(CustomReadmeSectionSchema).optional(),
    // Deprecated; use clientName instead.
    "client-class-name": z.string().optional()
});

export type BasePhpCustomConfigSchema = z.infer<typeof BasePhpCustomConfigSchema>;
