import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         prompt: "You are a helpful assistant",
 *         alias_prompt: "You are a helpful assistant",
 *         query: "What is the weather today",
 *         stream: true,
 *         alias_stream: true
 *     }
 */
export interface SendQueryRequest {
    prompt: SeedApi.literal.SendQueryRequestPrompt;
    optional_prompt?: SeedApi.literal.SendQueryRequestOptionalPrompt | null;
    alias_prompt: SeedApi.literal.AliasToPrompt;
    alias_optional_prompt?: SeedApi.literal.AliasToPrompt | null;
    query: string;
    stream: boolean;
    optional_stream?: boolean | null;
    alias_stream: SeedApi.literal.AliasToStream;
    alias_optional_stream?: SeedApi.literal.AliasToStream | null;
}
