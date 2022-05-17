import { z } from "zod";
import { BaseEncoderSchema } from "./BaseEncoderSchema";

export const InlineEncoderSchema = BaseEncoderSchema.extend({
    _type: z.literal("inline"),
    contentType: z.string(),
    generateEncode: z.function().args(z.any()).returns(z.any()),
    generateDecode: z.function().args(z.any()).returns(z.any()),
});

export type EncodingHandlersSchema = z.infer<typeof InlineEncoderSchema>;
