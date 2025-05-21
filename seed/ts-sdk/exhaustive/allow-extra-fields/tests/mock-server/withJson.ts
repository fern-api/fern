import { HttpResponseResolver, passthrough } from "msw";

/**
 * Creates a request matcher that validates if the request JSON body exactly matches the expected object
 * @param expectedBody - The exact body object to match against
 * @param resolver - Response resolver to execute if body matches
 */
export function withJson(expectedBody: unknown, resolver: HttpResponseResolver): HttpResponseResolver {
    return async (args) => {
        const { request } = args;

        try {
            // Clone the request to avoid consuming the body
            const clonedRequest = request.clone();
            const actualBody = await clonedRequest.json();

            // Compare JSON strings for equivalence
            if (JSON.stringify(actualBody) !== JSON.stringify(expectedBody)) {
                return passthrough();
            }

            // Body matched, execute the resolver
            return resolver(args);
        } catch (error) {
            // If parsing fails or it's not a JSON body, pass through
            return passthrough();
        }
    };
}
