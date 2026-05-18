import type * as SeedApi from "../../../index.js";
export type CommonsEventInfo = {
    type: "metadata";
} | {
    type: "tag";
    value?: SeedApi.examples.CommonsTag | undefined;
};
