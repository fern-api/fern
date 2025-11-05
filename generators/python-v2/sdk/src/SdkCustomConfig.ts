import { z } from "zod";

export const SdkCustomConfigSchema = z.object({
    /**
     * Whether to generate wire tests for validating SDK communication with mock servers.
     * Wire tests use WireMock to verify that generated SDKs make the correct HTTP requests.
     */
    enable_wire_tests: z.optional(z.boolean()).default(false)
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
