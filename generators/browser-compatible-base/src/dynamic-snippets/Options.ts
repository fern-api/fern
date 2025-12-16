import { AbstractFormatter } from "../ast/AbstractFormatter";

// Style of the generated snippets.
export enum Style {
    // Use a concise style for the snippet (top-level statements).
    Concise = "concise",

    // Use the full style for the snippet (a `main` function that can be run).
    Full = "full"
}

// Options used to customize the behavior of any dynamic snippets generator
export interface Options {
    // Config to use for a specific generator. This is independent of the customConfig
    // used by the generator, and is primarily used in testing environments.
    config?: unknown;

    // The formatter to use for the generated snippets.
    formatter?: AbstractFormatter;

    // Style of the generated snippets. By default, the executable style is used.
    style?: Style;

    // Skip client instantiation in the generated snippet. Useful for wire tests
    // where the client is already instantiated in the test setup.
    skipClientInstantiation?: boolean;
}
