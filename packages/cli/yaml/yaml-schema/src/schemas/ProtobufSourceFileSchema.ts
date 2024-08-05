import { z } from "zod";
import { ProtobufFileOptionsSchema } from "./ProtobufFileOptionsSchema";

export const ProtobufSourceFileSchema = z.strictObject({
    file: z
        .optional(z.string())
        .describe("The relative `.proto` source file path (i.e. how the file is imported between other files)."),
    "package-name": z.optional(z.string()).describe("The package name of the `.proto` file, if any."),
    options: z.optional(ProtobufFileOptionsSchema)
});

export type ProtobufSourceFileSchema = z.infer<typeof ProtobufSourceFileSchema>;
