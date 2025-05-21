// withHeaders.ts
import { HttpResponseResolver, passthrough } from "msw";

/**
 * Creates a request matcher that validates if request headers match specified criteria
 * @param expectedHeaders - Headers to match against
 * @param resolver - Response resolver to execute if headers match
 */
export function withHeaders(
    expectedHeaders: Record<string, string | RegExp | ((value: string) => boolean)>,
    resolver: HttpResponseResolver
): HttpResponseResolver {
    return (args) => {
        const { request } = args;
        const { headers } = request;

        // Check each expected header
        for (const [key, expectedValue] of Object.entries(expectedHeaders)) {
            // Get the header value (case-sensitive)
            const actualValue = headers.get(key);

            // If header doesn't exist, pass through to next handler
            if (actualValue === null) {
                return passthrough();
            }

            // Match based on the type of expected value
            if (typeof expectedValue === "function") {
                // Function predicate
                if (!expectedValue(actualValue)) {
                    return passthrough();
                }
            } else if (expectedValue instanceof RegExp) {
                // RegExp matching
                if (!expectedValue.test(actualValue)) {
                    return passthrough();
                }
            } else if (expectedValue !== actualValue) {
                // String equality
                return passthrough();
            }
        }

        // All headers matched, execute the resolver
        return resolver(args);
    };
}
