import { z } from "zod";

export const ApiReferenceEndpointConfigurationSchema = z.object({
    endpoint: z.string(),
    title: z.string().optional(),
    slug: z.string().optional(),
    icon: z.string().optional(),
    hidden: z.boolean().optional()
});

export type ApiReferenceEndpointConfigurationSchema = z.infer<typeof ApiReferenceEndpointConfigurationSchema>;

export const ApiReferenceOperationConfigurationSchema = z.object({
    operation: z.string(),
    title: z.string().optional(),
    slug: z.string().optional(),
    icon: z.string().optional(),
    hidden: z.boolean().optional()
});

export type ApiReferenceOperationConfigurationSchema = z.infer<typeof ApiReferenceOperationConfigurationSchema>;

export const ApiReferencePackageConfigurationSchema = z.union([
    z.string(),
    z.object({
        package: z.string(),
        title: z.string().optional(),
        slug: z.string().optional(),
        icon: z.string().optional(),
        hidden: z.boolean().optional(),
        summary: z.string().optional(),
        contents: z.array(z.lazy((): z.ZodTypeAny => ApiReferenceLayoutItemSchema)).optional()
    })
]);

export type ApiReferencePackageConfigurationSchema = z.infer<typeof ApiReferencePackageConfigurationSchema>;

export const ApiReferenceSectionConfigurationSchema = z.object({
    section: z.string(),
    slug: z.string().optional(),
    icon: z.string().optional(),
    collapsible: z.boolean().optional(),
    collapsedByDefault: z.boolean().optional(),
    contents: z.array(z.lazy((): z.ZodTypeAny => ApiReferenceLayoutItemSchema))
});

export type ApiReferenceSectionConfigurationSchema = z.infer<typeof ApiReferenceSectionConfigurationSchema>;

export const ApiReferenceLayoutItemSchema: z.ZodTypeAny = z.union([
    ApiReferenceEndpointConfigurationSchema,
    ApiReferenceOperationConfigurationSchema,
    ApiReferencePackageConfigurationSchema,
    ApiReferenceSectionConfigurationSchema,
    z.string()
]);

export type ApiReferenceLayoutItemSchema =
    | ApiReferenceEndpointConfigurationSchema
    | ApiReferenceOperationConfigurationSchema
    | ApiReferencePackageConfigurationSchema
    | ApiReferenceSectionConfigurationSchema
    | string;
