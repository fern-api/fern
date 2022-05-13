import { z } from "zod";
import { FileBasedEncoderSchema } from "./FileBasedEncoderSchema";
import { InlineEncoderSchema } from "./InlineEncoderSchema";

export const EncoderSchema = z.union([InlineEncoderSchema, FileBasedEncoderSchema]);

export type EncoderSchema = z.infer<typeof EncoderSchema>;
