import { z } from "zod";

export const SdkCustomConfigSchema = z.object({
    /**
     * Whether to generate wire tests for validating SDK communication with mock servers.
     * Wire tests use WireMock to verify that generated SDKs make the correct HTTP requests.
     */
    include_wire_tests: z.optional(z.boolean()).default(false),

    /**
     * Configuration options for wire test generation.
     */
    wire_test_config: z.optional(
        z.object({
            /**
             * Port number for the WireMock server (defaults to 8080)
             */
            wiremock_port: z.optional(z.number()).default(8080),

            /**
             * Directory where test files should be generated (defaults to "tests")
             */
            output_directory: z.optional(z.string()).default("tests"),

            /**
             * Prefix for generated test classes (defaults to "Test")
             */
            test_class_prefix: z.optional(z.string()).default("Test")
        })
    )
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
