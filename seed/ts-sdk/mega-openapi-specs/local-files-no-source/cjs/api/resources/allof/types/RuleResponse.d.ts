import type * as SeedApi from "../../../index.js";
export interface RuleResponse extends SeedApi.allof.AuditInfo {
    id: string;
    name: string;
    status: RuleResponse.Status;
    executionContext?: SeedApi.allof.RuleExecutionContext | undefined;
}
export declare namespace RuleResponse {
    const Status: {
        readonly Active: "active";
        readonly Inactive: "inactive";
        readonly Draft: "draft";
    };
    type Status = (typeof Status)[keyof typeof Status];
}
