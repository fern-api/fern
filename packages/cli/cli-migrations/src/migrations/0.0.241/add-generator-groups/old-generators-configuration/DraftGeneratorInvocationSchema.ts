import { z } from "zod";

import { BaseGeneratorInvocationSchema } from "./BaseGeneratorInvocationSchema";

export const DraftGeneratorInvocationSchema: z.ZodObject<
    {
        name: z.ZodString;
        version: z.ZodString;
        config: z.ZodUnknown;
        audiences: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    } & {
        mode: z.ZodUnion<[z.ZodLiteral<"publish">, z.ZodLiteral<"download-files">]>;
        "output-path": z.ZodOptional<z.ZodString>;
    },
    "strict",
    z.ZodTypeAny,
    {
        version: string;
        name: string;
        mode: "publish" | "download-files";
        audiences?: Array<string> | undefined;
        "output-path"?: string | undefined;
        config?: unknown;
    },
    {
        version: string;
        name: string;
        mode: "publish" | "download-files";
        audiences?: Array<string> | undefined;
        "output-path"?: string | undefined;
        config?: unknown;
    }
> = BaseGeneratorInvocationSchema.extend({
    mode: z.union([z.literal("publish"), z.literal("download-files")]),
    "output-path": z.optional(z.string())
});

export type DraftGeneratorInvocationSchema = z.infer<typeof DraftGeneratorInvocationSchema>;
