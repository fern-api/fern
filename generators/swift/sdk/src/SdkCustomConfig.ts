import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";
import { z } from "zod";

const defaults = {
    enableWireTests: true,
    nullableAsOptional: false
} as const;

export const SdkCustomConfigSchemaDefaults: { readonly enableWireTests: true; readonly nullableAsOptional: false } =
    defaults satisfies SdkCustomConfigSchema;

export const SdkCustomConfigSchema: z.ZodObject<
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
    } & { enableWireTests: z.ZodDefault<z.ZodBoolean>; nullableAsOptional: z.ZodDefault<z.ZodBoolean> },
    "strip",
    z.ZodTypeAny,
    {
        enableWireTests: boolean;
        nullableAsOptional: boolean;
        moduleName?: string | undefined;
        clientClassName?: string | undefined;
        environmentEnumName?: string | undefined;
        customReadmeSections?: { title: string; content: string }[] | undefined;
    },
    {
        enableWireTests?: boolean | undefined;
        nullableAsOptional?: boolean | undefined;
        moduleName?: string | undefined;
        clientClassName?: string | undefined;
        environmentEnumName?: string | undefined;
        customReadmeSections?: { title: string; content: string }[] | undefined;
    }
> = BaseSwiftCustomConfigSchema.extend({
    enableWireTests: z.boolean().default(defaults.enableWireTests),
    nullableAsOptional: z.boolean().default(defaults.nullableAsOptional)
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
