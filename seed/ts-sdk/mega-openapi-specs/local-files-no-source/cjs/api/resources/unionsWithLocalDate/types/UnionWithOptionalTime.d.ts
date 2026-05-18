import type * as SeedApi from "../../../index.js";
export type UnionWithOptionalTime = SeedApi.unionsWithLocalDate.UnionWithOptionalTime.Date | SeedApi.unionsWithLocalDate.UnionWithOptionalTime.Datetime;
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
