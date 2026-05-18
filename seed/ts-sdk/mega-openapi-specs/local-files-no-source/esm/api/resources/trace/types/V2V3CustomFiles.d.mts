import type * as SeedApi from "../../../index.mjs";
export type V2V3CustomFiles = {
    type: "basic";
} | {
    type: "custom";
    value?: Record<string, SeedApi.trace.V2V3Files> | undefined;
};
