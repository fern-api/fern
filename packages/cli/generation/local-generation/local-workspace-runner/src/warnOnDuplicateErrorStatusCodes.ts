import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { Logger } from "@fern-api/logger";

// Module-level Set to track which status codes we've already warned about.
// This ensures we only warn once per `fern generate` command, not once per generator.
const warnedStatusCodes = new Set<string>();

/**
 * Warns when multiple errors map to the same HTTP status code within an endpoint.
 * This is a CLI-level warning that runs once per workspace, not per generator.
 *
 * When duplicate status codes are detected, only the first error for each status code
 * will be thrown by generated SDKs. This function emits a warning to alert API authors
 * about this behavior.
 */
export function warnOnDuplicateErrorStatusCodes(ir: IntermediateRepresentation, logger: Logger): void {
    for (const [serviceId, service] of Object.entries(ir.services)) {
        for (const endpoint of service.endpoints) {
            // Group errors by status code for this endpoint
            const errorsByStatusCode = new Map<number, string[]>();

            for (const responseError of endpoint.errors) {
                const errorId = responseError.error.errorId;
                const errorDeclaration = ir.errors[errorId];
                if (errorDeclaration == null) {
                    continue;
                }

                const statusCode = errorDeclaration.statusCode;
                const errorName = errorDeclaration.name.name.originalName;

                const existingErrors = errorsByStatusCode.get(statusCode);
                if (existingErrors != null) {
                    existingErrors.push(errorName);
                } else {
                    errorsByStatusCode.set(statusCode, [errorName]);
                }
            }

            // Warn about any status codes with multiple errors
            for (const [statusCode, errorNames] of errorsByStatusCode.entries()) {
                if (errorNames.length > 1) {
                    // Create a unique key to avoid duplicate warnings for the same status code
                    const warningKey = `${statusCode}:${errorNames.join(",")}`;
                    if (warnedStatusCodes.has(warningKey)) {
                        continue;
                    }
                    warnedStatusCodes.add(warningKey);

                    const firstError = errorNames[0];
                    const ignoredErrors = errorNames.slice(1);
                    const serviceName = service.name.fernFilepath.allParts.map((p) => p.originalName).join(".");
                    const endpointName = endpoint.name.originalName;

                    logger.warn(
                        `Multiple errors map to HTTP status code ${statusCode} in ${serviceName}.${endpointName}. ` +
                            `Only '${firstError}' will be thrown; '${ignoredErrors.join("', '")}' will be ignored.`
                    );
                }
            }
        }
    }
}
