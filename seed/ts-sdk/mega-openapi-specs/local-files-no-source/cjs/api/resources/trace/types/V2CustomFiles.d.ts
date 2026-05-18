import type * as SeedApi from "../../../index.js";
export type V2CustomFiles = {
    type: "basic";
} | {
    type: "custom";
    value?: Record<string, SeedApi.trace.V2Files> | undefined;
};
