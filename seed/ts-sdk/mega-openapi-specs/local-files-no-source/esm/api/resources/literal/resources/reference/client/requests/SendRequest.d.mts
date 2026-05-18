import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         prompt: "You are a helpful assistant",
 *         query: "What is the weather today",
 *         stream: false,
 *         ending: "\\$ending",
 *         context: "You're super wise",
 *         containerObject: {
 *             nestedObjects: [{
 *                     literal1: "literal1",
 *                     literal2: "literal2",
 *                     strProp: "strProp"
 *                 }]
 *         }
 *     }
 */
export interface SendRequest {
    prompt: SendRequest.Prompt;
    query: string;
    stream: boolean;
    ending: SendRequest.Ending;
    context: SeedApi.literal.SomeLiteral;
    maybeContext?: SeedApi.literal.SomeLiteral | null;
    containerObject: SeedApi.literal.ContainerObject;
}
export declare namespace SendRequest {
    const Prompt: {
        readonly YouAreAHelpfulAssistant: "You are a helpful assistant";
    };
    type Prompt = (typeof Prompt)[keyof typeof Prompt];
    const Ending: {
        readonly Ending: "$ending";
    };
    type Ending = (typeof Ending)[keyof typeof Ending];
}
