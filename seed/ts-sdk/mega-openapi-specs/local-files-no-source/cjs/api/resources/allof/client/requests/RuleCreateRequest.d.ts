/**
 * @example
 *     {
 *         name: "name",
 *         executionContext: "prod"
 *     }
 */
export interface RuleCreateRequest {
    name: string;
    /** Execution context for the rule, excluding the prod environment. */
    executionContext: RuleCreateRequest.ExecutionContext;
}
export declare namespace RuleCreateRequest {
    /** Execution context for the rule, excluding the prod environment. */
    const ExecutionContext: {
        readonly Prod: "prod";
        readonly Staging: "staging";
        readonly Dev: "dev";
    };
    type ExecutionContext = (typeof ExecutionContext)[keyof typeof ExecutionContext];
}
