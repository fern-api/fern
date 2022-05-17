import { z } from "zod";
import { BaseEncoderSchema } from "./BaseEncoderSchema";

export const FileBasedEncoderSchema = BaseEncoderSchema.extend({
    _type: z.literal("fileBased"),
    name: z.string(),
    writeEncoder: z.function().args(z.any()).returns(z.any()),
    generateEncode: z.function().args(z.any()).returns(z.any()),
    generateDecode: z.function().args(z.any()).returns(z.any()),
});

export type FileBasedEncoderSchema = z.infer<typeof FileBasedEncoderSchema>;
