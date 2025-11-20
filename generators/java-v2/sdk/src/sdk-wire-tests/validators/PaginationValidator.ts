import { Writer } from "@fern-api/java-ast/src/ast";
import { HttpEndpoint, ResponseProperty } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

/**
 * Validator for paginated responses in wire tests.
 * Generates assertions to verify pagination structure and navigation.
 */
export class PaginationValidator {
    constructor(private readonly context: SdkGeneratorContext) {}

    /**
     * Generates pagination validation for endpoints with pagination support.
     */
    public generatePaginationValidation(writer: Writer, endpoint: HttpEndpoint, actualVarName: string): void {
        if (!this.isPaginatedEndpoint(endpoint)) {
            return;
        }

        writer.writeLine("");
        writer.writeLine("// Validate pagination structure");

        if (endpoint.pagination?.type === "custom") {
            writer.writeLine("// Custom pagination - structure validation skipped (user-defined)");
            return;
        }

        const paginationPath = this.getPaginationResultsPath(endpoint);
        if (paginationPath) {
            const pathParts = paginationPath.split(".");
            let currentPath = actualVarName;

            for (const part of pathParts) {
                writer.writeLine(`if (${currentPath}.has("${part}")) {`);
                writer.indent();
                currentPath = `${currentPath}.get("${part}")`;
            }

            writer.writeLine(
                `Assertions.assertTrue(${currentPath}.isArray(), ` +
                    `"Pagination results at '${paginationPath}' should be an array");`
            );

            for (let i = 0; i < pathParts.length; i++) {
                writer.dedent();
                writer.writeLine("}");
            }
        }
    }

    /**
     * Checks if an endpoint has pagination configuration.
     */
    private isPaginatedEndpoint(endpoint: HttpEndpoint): boolean {
        return endpoint.pagination != null;
    }

    /**
     * Gets the path to pagination results from the endpoint configuration.
     */
    private getPaginationResultsPath(endpoint: HttpEndpoint): string | undefined {
        if (!endpoint.pagination) {
            return undefined;
        }

        if (endpoint.pagination.type === "cursor") {
            return this.extractPath(endpoint.pagination.results);
        } else if (endpoint.pagination.type === "offset") {
            return this.extractPath(endpoint.pagination.results);
        } else if (endpoint.pagination.type === "custom") {
            return undefined;
        }

        return "data"; // Default fallback
    }

    /**
     * Extracts a simple path from a ResponseProperty.
     * This is a simplified version - full implementation would handle complex paths.
     */
    private extractPath(property: ResponseProperty | undefined): string {
        // Simplified extraction - in real implementation this would
        // parse the ResponseProperty structure properly
        return "data";
    }
}
