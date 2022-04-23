import { z } from "zod";
import { WireMessageSchema } from "./WireMessageSchema";

export const HttpResponseSchema = WireMessageSchema;

export type HttpResponseSchema = z.infer<typeof HttpResponseSchema>;
