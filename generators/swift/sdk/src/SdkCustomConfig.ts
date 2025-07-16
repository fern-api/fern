import { z } from "zod"

import { BaseSwiftCustomConfigSchema } from "@fern-api/swift-codegen"

export const SdkCustomConfigSchema = BaseSwiftCustomConfigSchema

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>
