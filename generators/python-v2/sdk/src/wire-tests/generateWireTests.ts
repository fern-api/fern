import { WriteablePythonFile } from "@fern-api/python-base";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { WireTestGenerator } from "./WireTestGenerator";
import { WireTestSetupGenerator } from "./WireTestSetupGenerator";

/**
 * Main entry point for generating wire tests for the Python SDK.
 * This function orchestrates the generation of both test files and setup files.
 *
 * @param context - The SDK generator context containing IR, config, and project
 * @returns Array of WriteablePythonFile objects containing the generated test files
 */
export function generateWireTests({ context }: { context: SdkGeneratorContext }): WriteablePythonFile[] {
    context.logger.info("Starting wire test generation...");

    // Validate prerequisites
    if (!context.ir.dynamic) {
        throw new Error("Cannot generate wire tests without dynamic IR");
    }

    // Check if there are any HTTP services with endpoints
    const servicesWithEndpoints = Object.values(context.ir.services).filter(
        (service) => service.endpoints && service.endpoints.length > 0
    );

    if (servicesWithEndpoints.length === 0) {
        context.logger.warn("No HTTP services with endpoints found, skipping wire test generation");
        return [];
    }

    // Check if there are any endpoints with examples (required for wire tests)
    const hasEndpointsWithExamples = servicesWithEndpoints.some((service) =>
        service.endpoints.some((endpoint) => {
            const dynamicEndpoint = context.ir.dynamic?.endpoints[endpoint.id];
            return dynamicEndpoint?.examples && dynamicEndpoint.examples.length > 0;
        })
    );

    if (!hasEndpointsWithExamples) {
        context.logger.warn("No endpoints with examples found, skipping wire test generation");
        return [];
    }

    try {
        // Generate the wire test files
        const generator = new WireTestGenerator(context);
        const testFiles = generator.generate();

        // Generate setup files (docker-compose, wiremock config, pytest config)
        const setupGenerator = new WireTestSetupGenerator(context, context.ir);
        setupGenerator.generate();

        // Log generation results
        const serviceCount = new Set(testFiles.map((file) => file.filename.replace(/^test_/, "").replace(/_wire$/, "")))
            .size;

        context.logger.info(`Wire test generation completed successfully:`);
        context.logger.info(`  - Generated ${testFiles.length} test files`);
        context.logger.info(`  - Covered ${serviceCount} services`);
        context.logger.info(`  - Created WireMock configuration and Docker Compose setup`);
        context.logger.info(`  - Generated pytest configuration`);

        return testFiles;
    } catch (error) {
        context.logger.error(`Failed to generate wire tests: ${error}`);
        throw error;
    }
}
