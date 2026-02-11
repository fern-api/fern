import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";
import { moduleConfigSchema } from "./ModuleConfigSchema";
import { relativePathSchema } from "./RelativePathSchema";

export const baseGoCustomConfigSchema: z.ZodObject<
    {
        module: z.ZodOptional<
            z.ZodObject<
                {
                    path: z.ZodString;
                    version: z.ZodOptional<z.ZodString>;
                    imports: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
                },
                "strip",
                z.ZodTypeAny,
                { path: string; version?: string | undefined; imports?: Record<string, string> | undefined },
                { path: string; version?: string | undefined; imports?: Record<string, string> | undefined }
            >
        >;
        packageName: z.ZodOptional<z.ZodString>;
        packagePath: z.ZodOptional<
            z.ZodEffects<
                z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>,
                string,
                string
            >
        >;
        importPath: z.ZodOptional<
            z.ZodEffects<
                z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>,
                string,
                string
            >
        >;
        alwaysSendRequiredProperties: z.ZodOptional<z.ZodBoolean>;
        clientConstructorName: z.ZodOptional<z.ZodString>;
        clientName: z.ZodOptional<z.ZodString>;
        enableExplicitNull: z.ZodOptional<z.ZodBoolean>;
        errorCodes: z.ZodOptional<z.ZodEnum<["per-endpoint", "global"]>>;
        exportedClientName: z.ZodOptional<z.ZodString>;
        includeLegacyClientOptions: z.ZodOptional<z.ZodBoolean>;
        inlinePathParameters: z.ZodOptional<z.ZodBoolean>;
        inlineFileProperties: z.ZodOptional<z.ZodBoolean>;
        union: z.ZodOptional<z.ZodEnum<["v0", "v1"]>>;
        useReaderForBytesRequest: z.ZodOptional<z.ZodBoolean>;
        useDefaultRequestParameterValues: z.ZodOptional<z.ZodBoolean>;
        gettersPassByValue: z.ZodOptional<z.ZodBoolean>;
        enableWireTests: z.ZodOptional<z.ZodBoolean>;
        exportAllRequestsAtRoot: z.ZodOptional<z.ZodBoolean>;
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
        customPagerName: z.ZodOptional<z.ZodString>;
    },
    "strip",
    z.ZodTypeAny,
    {
        union?: "v0" | "v1" | undefined;
        packagePath?: string | undefined;
        useDefaultRequestParameterValues?: boolean | undefined;
        exportAllRequestsAtRoot?: boolean | undefined;
        customReadmeSections?: Array<{ title: string; content: string }> | undefined;
        inlineFileProperties?: boolean | undefined;
        inlinePathParameters?: boolean | undefined;
        customPagerName?: string | undefined;
        enableWireTests?: boolean | undefined;
        module?:
            | { path: string; version?: string | undefined; imports?: Record<string, string> | undefined }
            | undefined;
        clientName?: string | undefined;
        packageName?: string | undefined;
        importPath?: string | undefined;
        alwaysSendRequiredProperties?: boolean | undefined;
        clientConstructorName?: string | undefined;
        enableExplicitNull?: boolean | undefined;
        errorCodes?: "global" | "per-endpoint" | undefined;
        exportedClientName?: string | undefined;
        includeLegacyClientOptions?: boolean | undefined;
        useReaderForBytesRequest?: boolean | undefined;
        gettersPassByValue?: boolean | undefined;
    },
    {
        union?: "v0" | "v1" | undefined;
        packagePath?: string | undefined;
        useDefaultRequestParameterValues?: boolean | undefined;
        exportAllRequestsAtRoot?: boolean | undefined;
        customReadmeSections?: Array<{ title: string; content: string }> | undefined;
        inlineFileProperties?: boolean | undefined;
        inlinePathParameters?: boolean | undefined;
        customPagerName?: string | undefined;
        enableWireTests?: boolean | undefined;
        module?:
            | { path: string; version?: string | undefined; imports?: Record<string, string> | undefined }
            | undefined;
        clientName?: string | undefined;
        packageName?: string | undefined;
        importPath?: string | undefined;
        alwaysSendRequiredProperties?: boolean | undefined;
        clientConstructorName?: string | undefined;
        enableExplicitNull?: boolean | undefined;
        errorCodes?: "global" | "per-endpoint" | undefined;
        exportedClientName?: string | undefined;
        includeLegacyClientOptions?: boolean | undefined;
        useReaderForBytesRequest?: boolean | undefined;
        gettersPassByValue?: boolean | undefined;
    }
> = z.object({
    module: moduleConfigSchema.optional(),
    packageName: z.string().optional(),
    packagePath: relativePathSchema.optional(),
    importPath: relativePathSchema.optional(),

    alwaysSendRequiredProperties: z.boolean().optional(),
    clientConstructorName: z.string().optional(),
    clientName: z.string().optional(),
    enableExplicitNull: z.boolean().optional(),
    errorCodes: z.enum(["per-endpoint", "global"]).optional(),
    exportedClientName: z.string().optional(),
    includeLegacyClientOptions: z.boolean().optional(),
    inlinePathParameters: z.boolean().optional(),
    inlineFileProperties: z.boolean().optional(),
    union: z.enum(["v0", "v1"]).optional(),
    useReaderForBytesRequest: z.boolean().optional(),
    useDefaultRequestParameterValues: z.boolean().optional(),
    gettersPassByValue: z.boolean().optional(),
    enableWireTests: z.boolean().optional(),
    exportAllRequestsAtRoot: z.boolean().optional(),
    customReadmeSections: z.array(CustomReadmeSectionSchema).optional(),
    customPagerName: z.string().optional()
});

export type BaseGoCustomConfigSchema = z.infer<typeof baseGoCustomConfigSchema>;
