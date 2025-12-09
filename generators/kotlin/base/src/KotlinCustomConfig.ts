import { z } from "zod";

export const KotlinCustomConfigSchema = z.object({
    packageName: z.string().optional(),
    groupId: z.string().optional(),
    artifactId: z.string().optional(),
    version: z.string().optional(),
    enableWireTests: z.boolean().optional(),
    enableCoroutines: z.boolean().optional(),
    serializationLibrary: z.enum(["kotlinx-serialization", "moshi", "gson"]).optional(),
    httpClient: z.enum(["ktor", "okhttp"]).optional()
});

export type KotlinCustomConfig = z.infer<typeof KotlinCustomConfigSchema>;

export const DEFAULT_KOTLIN_CUSTOM_CONFIG: KotlinCustomConfig = {
    enableWireTests: false,
    enableCoroutines: true,
    serializationLibrary: "kotlinx-serialization",
    httpClient: "ktor"
};
