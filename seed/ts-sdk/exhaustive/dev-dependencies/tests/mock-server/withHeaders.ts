// withHeaders.ts
import { HttpResponseResolver, passthrough } from "msw";

/**
 * Creates a request matcher that validates if request headers match specified criteria
 * @param expectedHeaders - Headers to match against
 * @param resolver - Response resolver to execute if headers match
 */
export function withHeaders(
    expectedHeaders: Record<string, string | RegExp | ((value: string) => boolean)>,
    resolver: HttpResponseResolver,
): HttpResponseResolver {
    return (args) => {
        const { request } = args;
        const { headers } = request;

        // Track mismatched headers
        const mismatches: Record<
            string,
            { actual: string | null; expected: string | RegExp | ((value: string) => boolean) }
        > = {};

        // Check each expected header
        for (const [key, expectedValue] of Object.entries(expectedHeaders)) {
            // Get the header value (case-sensitive)
            const actualValue = headers.get(key);

            // If header doesn't exist, record the mismatch
            if (actualValue === null) {
                mismatches[key] = { actual: null, expected: expectedValue };
                continue;
            }

            // Match based on the type of expected value
            if (typeof expectedValue === "function") {
                // Function predicate
                if (!expectedValue(actualValue)) {
                    mismatches[key] = { actual: actualValue, expected: expectedValue };
                }
            } else if (expectedValue instanceof RegExp) {
                // RegExp matching
                if (!expectedValue.test(actualValue)) {
                    mismatches[key] = { actual: actualValue, expected: expectedValue };
                }
            } else if (expectedValue !== actualValue) {
                // String equality
                mismatches[key] = { actual: actualValue, expected: expectedValue };
            }
        }

        // If there are mismatches, throw an error
        if (Object.keys(mismatches).length > 0) {
            const formattedMismatches = formatHeaderMismatches(mismatches);
            console.error("Header mismatch:", formattedMismatches);
            return passthrough();
        }

        // All headers matched, execute the resolver
        return resolver(args);
    };
}

function formatHeaderMismatches(
    mismatches: Record<string, { actual: string | null; expected: string | RegExp | ((value: string) => boolean) }>,
): Record<string, { actual: string | null; expected: string }> {
    const formatted: Record<string, { actual: string | null; expected: string }> = {};

    for (const [key, { actual, expected }] of Object.entries(mismatches)) {
        formatted[key] = {
            actual,
            expected:
                expected instanceof RegExp
                    ? expected.toString()
                    : typeof expected === "function"
                      ? "[Function]"
                      : expected,
        };
    }

    return formatted;
}
