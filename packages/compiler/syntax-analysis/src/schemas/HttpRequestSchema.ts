import { z } from "zod";
import { WireMessageSchema } from "./WireMessageSchema";

export const HttpRequestSchema = WireMessageSchema;

export type HttpRequestSchema = z.infer<typeof HttpRequestSchema>;
