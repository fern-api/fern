import { File, Style } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { java } from "@fern-api/java-ast";
import { Writer } from "@fern-api/java-ast/src/ast";
import { DynamicSnippetsGenerator } from "@fern-api/java-dynamic-snippets";
import {
    AuthScheme,
    dynamic,
    EnvironmentsConfig,
    HttpEndpoint,
    ObjectProperty,
    Pagination,
    ResponseProperty
} from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { convertDynamicEndpointSnippetRequest } from "../utils/convertEndpointSnippetRequest";
import { convertIr } from "../utils/convertIr";
import { WireTestDataExtractor, WireTestExample } from "../wire-tests/WireTestDataExtractor";

interface MultiUrlEnvironment {
    urls: Record<string, string>;
}

/**
 * SDK Contract Test Generator - Generates contract tests that validate SDK adherence to API specifications.
 * These tests use MockWebServer to verify that generated SDKs correctly implement the API contract,
 * including request formatting, response parsing, authentication, and error handling.
 */
export class SdkContractTestGenerator {
    constructor(private readonly context: SdkGeneratorContext) {}

    /**
     * Main entry point for generating contract tests.
     * Only generates tests if the enable-wire-tests flag is set in custom configuration.
     */
    public async generate(): Promise<void> {
        const customConfig = this.context.customConfig as { "enable-wire-tests"?: boolean };
        const enableWireTests = customConfig["enable-wire-tests"];

        if (!enableWireTests) {
            this.context.logger.debug("Wire tests are not enabled. Skipping generation.");
            return;
        }

        const dynamicIr = this.context.ir.dynamic;
        if (!dynamicIr) {
            this.context.logger.error("Dynamic IR is required for wire test generation but is not available.");
            return;
        }

        const dynamicSnippetsGenerator = new DynamicSnippetsGenerator({
            ir: convertIr(dynamicIr),
            config: this.context.config
        });

        // For now, delegate to the existing WireTestGenerator
        // This will be replaced with modular implementation
        const wireTestGenerator = new (await import("../wire-tests/WireTestGenerator")).WireTestGenerator(this.context);
        await wireTestGenerator.generate();
    }
}