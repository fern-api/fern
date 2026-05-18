import type * as SeedApi from "../../../index.mjs";
export type UnionWithTime = SeedApi.unionsWithLocalDate.UnionWithTime.Value | SeedApi.unionsWithLocalDate.UnionWithTime.Date | SeedApi.unionsWithLocalDate.UnionWithTime.Datetime;
export declare namespace UnionWithTime {
    interface Value {
        type: "value";
        value?: number | undefined;
    }
    interface Date {
        type: "date";
        value?: string | undefined;
    }
    interface Datetime {
        type: "datetime";
        value?: string | undefined;
    }
}
