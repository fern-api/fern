import { BasePhpCustomConfigSchema } from "@fern-api/php-codegen";
import { z } from "zod";

export const SdkCustomConfigSchema: z.ZodEffects<
    z.ZodObject<
        { "enable-wire-tests": z.ZodOptional<z.ZodBoolean>; "custom-pager-classname": z.ZodOptional<z.ZodString> } & {
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
        "strict",
        z.ZodTypeAny,
        {
            "client-class-name"?: string | undefined;
            "enable-wire-tests"?: boolean | undefined;
            "custom-pager-classname"?: string | undefined;
            clientName?: string | undefined;
            inlinePathParameters?: boolean | undefined;
            packageName?: string | undefined;
            packagePath?: string | undefined;
            propertyAccess?: "public" | "private" | undefined;
            namespace?: string | undefined;
            composerJson?: Record<string, any> | undefined;
            customReadmeSections?: { title: string; content: string }[] | undefined;
        },
        {
            "client-class-name"?: string | undefined;
            "enable-wire-tests"?: boolean | undefined;
            "custom-pager-classname"?: string | undefined;
            clientName?: string | undefined;
            inlinePathParameters?: boolean | undefined;
            packageName?: string | undefined;
            packagePath?: string | undefined;
            propertyAccess?: "public" | "private" | undefined;
            namespace?: string | undefined;
            composerJson?: Record<string, any> | undefined;
            customReadmeSections?: { title: string; content: string }[] | undefined;
        }
    >,
    {
        enableWireTests: boolean;
        customPagerClassname: string;
        "client-class-name"?: string | undefined;
        "enable-wire-tests"?: boolean | undefined;
        "custom-pager-classname"?: string | undefined;
        clientName?: string | undefined;
        inlinePathParameters?: boolean | undefined;
        packageName?: string | undefined;
        packagePath?: string | undefined;
        propertyAccess?: "public" | "private" | undefined;
        namespace?: string | undefined;
        composerJson?: Record<string, any> | undefined;
        customReadmeSections?: { title: string; content: string }[] | undefined;
    },
    {
        "client-class-name"?: string | undefined;
        "enable-wire-tests"?: boolean | undefined;
        "custom-pager-classname"?: string | undefined;
        clientName?: string | undefined;
        inlinePathParameters?: boolean | undefined;
        packageName?: string | undefined;
        packagePath?: string | undefined;
        propertyAccess?: "public" | "private" | undefined;
        namespace?: string | undefined;
        composerJson?: Record<string, any> | undefined;
        customReadmeSections?: { title: string; content: string }[] | undefined;
    }
> = z
    .strictObject({
        // Deprecated; use clientName instead.
        "client-class-name": z.string().optional(),
        // Enable WireMock-based wire tests generation
        "enable-wire-tests": z.boolean().optional(),
        // Custom class name for the CustomPager class (used for custom pagination)
        "custom-pager-classname": z.string().optional()
    })
    .extend(BasePhpCustomConfigSchema.shape)
    .transform((config) => ({
        ...config,
        enableWireTests: config["enable-wire-tests"] ?? false,
        customPagerClassname: config["custom-pager-classname"] ?? "CustomPager"
    }));

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
