/** Execution environment for a rule. */
export declare const RuleExecutionContext: {
    readonly Prod: "prod";
    readonly Staging: "staging";
    readonly Dev: "dev";
};
export type RuleExecutionContext = (typeof RuleExecutionContext)[keyof typeof RuleExecutionContext];
