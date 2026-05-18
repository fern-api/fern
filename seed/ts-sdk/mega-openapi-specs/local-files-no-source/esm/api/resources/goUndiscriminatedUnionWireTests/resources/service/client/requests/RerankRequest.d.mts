import type * as SeedApi from "../../../../../../index.mjs";
/**
 * @example
 *     {
 *         documents: [{
 *                 text: "Carson City is the capital city of the American state of Nevada."
 *             }, {
 *                 text: "Washington, D.C. is the capital of the United States."
 *             }],
 *         query: "What is the capital of the United States?"
 *     }
 */
export interface RerankRequest {
    documents: SeedApi.goUndiscriminatedUnionWireTests.DocumentItem[];
    query: string;
}
