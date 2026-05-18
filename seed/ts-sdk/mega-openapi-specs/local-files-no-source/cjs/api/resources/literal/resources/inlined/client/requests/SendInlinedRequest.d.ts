import type * as SeedApi from "../../../../../../index.js";
/**
 * @example
 *     {
 *         prompt: "You are a helpful assistant",
 *         context: "You're super wise",
 *         query: "What is the weather today",
 *         temperature: 10.1,
 *         stream: false,
 *         aliasedContext: "You're super wise",
 *         maybeContext: "You're super wise",
 *         objectWithLiteral: {
 *             nestedLiteral: {
 *                 myLiteral: "How super cool"
 *             }
 *         }
 *     }
 */
export interface SendInlinedRequest {
    prompt: SendInlinedRequest.Prompt;
    context?: SendInlinedRequest.Context | null;
    query: string;
    temperature?: number | null;
    stream: boolean;
    aliasedContext: SeedApi.literal.SomeAliasedLiteral;
    maybeContext?: SeedApi.literal.SomeAliasedLiteral | null;
    objectWithLiteral: SeedApi.literal.ATopLevelLiteral;
}
export declare namespace SendInlinedRequest {
    const Prompt: {
        readonly YouAreAHelpfulAssistant: "You are a helpful assistant";
    };
    type Prompt = (typeof Prompt)[keyof typeof Prompt];
    const Context: {
        readonly YoureSuperWise: "You're super wise";
    };
    type Context = (typeof Context)[keyof typeof Context];
}
