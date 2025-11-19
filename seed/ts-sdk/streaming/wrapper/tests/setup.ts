
expect.extend({
    toContainHeaders(this: jest.MatcherContext, actual: unknown, expectedHeaders: Record<string, string>) {
        const isHeaders = actual instanceof Headers;
        const isPlainObject = typeof actual === "object" && actual !== null && !Array.isArray(actual);

        if (!isHeaders && !isPlainObject) {
            throw new TypeError("Received value must be an instance of Headers or a plain object!");
        }

        if (typeof expectedHeaders !== "object" || expectedHeaders === null || Array.isArray(expectedHeaders)) {
            throw new TypeError("Expected headers must be a plain object!");
        }

        const missingHeaders: string[] = [];
        const mismatchedHeaders: Array<{ key: string; expected: string; actual: string | null }> = [];

        // Create a map of lowercase header keys to actual values for case-insensitive lookup
        const actualHeadersMap = new Map<string, string>();
        
        if (isHeaders) {
            for (const [key, value] of (actual as Headers).entries()) {
                actualHeadersMap.set(key.toLowerCase(), value);
            }
        } else {
            for (const [key, value] of Object.entries(actual as Record<string, string>)) {
                actualHeadersMap.set(key.toLowerCase(), value);
            }
        }

        for (const [key, value] of Object.entries(expectedHeaders)) {
            const lowerKey = key.toLowerCase();
            const actualValue = actualHeadersMap.get(lowerKey) ?? null;

            if (actualValue === null || actualValue === undefined) {
                missingHeaders.push(key);
            } else if (actualValue !== value) {
                mismatchedHeaders.push({ key, expected: value, actual: actualValue });
            }
        }

        const pass = missingHeaders.length === 0 && mismatchedHeaders.length === 0;
        const actualType = isHeaders ? "Headers" : "object";

        if (pass) {
            return {
                message: () => "expected " + actualType + " not to contain " + this.utils.printExpected(expectedHeaders),
                pass: true,
            };
        } else {
            const messages: string[] = [];

            if (missingHeaders.length > 0) {
                messages.push("Missing headers: " + this.utils.printExpected(missingHeaders.join(", ")));
            }

            if (mismatchedHeaders.length > 0) {
                const mismatches = mismatchedHeaders.map(
                    ({ key, expected, actual }) =>
                        key + ": expected " + this.utils.printExpected(expected) + " but got " + this.utils.printReceived(actual),
                );
                messages.push(mismatches.join("\n"));
            }

            return {
                message: () =>
                    "expected " + actualType + " to contain " + this.utils.printExpected(expectedHeaders) + "\n\n" + messages.join("\n"),
                pass: false,
            };
        }
    },
});

declare global {
    namespace jest {
        interface Matchers<R> {
            toContainHeaders(expectedHeaders: Record<string, string>): R;
        }
        interface Expect {
            toContainHeaders(expectedHeaders: Record<string, string>): any;
        }
        interface InverseAsymmetricMatchers {
            toContainHeaders(expectedHeaders: Record<string, string>): any;
        }
    }
}

export {};
