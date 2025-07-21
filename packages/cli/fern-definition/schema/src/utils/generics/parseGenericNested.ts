export interface ParseGenericNested {
    name: string;
    arguments: (string | ParseGenericNested)[];
}

const MAX_RECURSION_DEPTH = 128;
export function parseGenericNested(input: string): ParseGenericNested | undefined {
    let index = 0;
    let depth = 0; // Track recursion depth to prevent infinite loops

    function parseToken(): ParseGenericNested | string | undefined {
        // Skip whitespace
        // biome-ignore lint/style/noNonNullAssertion: allow
        while (index < input.length && /\s/.test(input[index]!)) {
            index++;
        }

        if (index >= input.length) {
            return undefined;
        }

        // Parse the type name
        let name = "";
        while (index < input.length && input[index] !== "<" && input[index] !== "," && input[index] !== ">") {
            // Allow anything except '<', ',' or '>'
            name += input[index++];
        }

        if (!name.trim()) {
            return undefined;
        }

        // Skip whitespace
        // biome-ignore lint/style/noNonNullAssertion: allow
        while (index < input.length && /\s/.test(input[index]!)) {
            index++;
        }

        // Check if there are generic arguments
        if (index < input.length && input[index] === "<") {
            index++; // consume '<'
            depth++;

            if (depth > MAX_RECURSION_DEPTH) {
                // Arbitrary limit to prevent infinite recursion
                throw new Error("Internal error; Exceeded maximum recursion depth while parsing generics.");
            }

            const result = { name: name.trim(), arguments: [] as (ParseGenericNested | string)[] };

            while (index < input.length && input[index] !== ">") {
                // Skip whitespace and commas
                // biome-ignore lint/style/noNonNullAssertion: allow
                while (index < input.length && /[\s,]/.test(input[index]!)) {
                    index++;
                }

                if (index < input.length && input[index] !== ">") {
                    const arg = parseToken();
                    if (arg) {
                        result.arguments.push(arg);
                    }
                }
            }

            if (index < input.length && input[index] === ">") {
                index++; // consume '>'
                depth--;
            } else {
                throw new Error("Malformed input: missing closing '>' for generic arguments.");
            }

            return result;
        } else {
            // No generic arguments, return as string
            return name.trim();
        }
    }

    const result = parseToken();
    if (typeof result === "object") {
        return result;
    }
    return undefined;
}
