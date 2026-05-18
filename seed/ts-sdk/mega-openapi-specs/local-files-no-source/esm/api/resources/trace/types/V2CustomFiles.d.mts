import type * as SeedApi from "../../../index.mjs";
export type V2CustomFiles = {
    type: "basic";
} | {
    type: "custom";
    value?: Record<string, SeedApi.trace.V2Files> | undefined;
};
