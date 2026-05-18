import type * as SeedApi from "../../../index.js";
export type Status = SeedApi.nullable.Status.Active | SeedApi.nullable.Status.Archived | SeedApi.nullable.Status.SoftDeleted;
export declare namespace Status {
    interface Active {
        type: "active";
    }
    interface Archived {
        type: "archived";
        value?: (string | null) | undefined;
    }
    interface SoftDeleted {
        type: "soft-deleted";
        value?: (string | null) | undefined;
    }
}
