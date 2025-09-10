import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen";
import { z } from "zod";

export const SdkCustomConfigSchema = BaseSwiftCustomConfigSchema;

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
