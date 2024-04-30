import { ExampleEndpointCall, HttpEndpointExample } from "@fern-fern/ir-sdk/api";

export function getExampleEndpointCalls(examples: HttpEndpointExample[]): ExampleEndpointCall[] {
    // If any of the examples are user provided, we should only include those.
    if (examples.some((example) => example.exampleType === "userProvided")) {
        return examples.filter((example) => example.exampleType === "userProvided");
    }
    // Otherwise we should only include a single one of the generated examples.
    const maybeGeneratedExample = examples.find((example) => example.exampleType === "generated");
    if (maybeGeneratedExample != null) {
        return [maybeGeneratedExample];
    }
    return [];
}
