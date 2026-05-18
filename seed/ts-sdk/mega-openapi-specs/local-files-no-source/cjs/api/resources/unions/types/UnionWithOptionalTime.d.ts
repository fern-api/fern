import type * as SeedApi from "../../../index.js";
export type UnionWithOptionalTime = SeedApi.unions.UnionWithOptionalTime.Date | SeedApi.unions.UnionWithOptionalTime.Datetime;
export declare namespace UnionWithOptionalTime {
    interface Date {
        type: "date";
        value?: (string | null) | undefined;
    }
    interface Datetime {
        type: "datetime";
        value?: (string | null) | undefined;
    }
}
