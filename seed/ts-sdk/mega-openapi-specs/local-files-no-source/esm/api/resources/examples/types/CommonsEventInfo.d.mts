import type * as SeedApi from "../../../index.mjs";
export type CommonsEventInfo = {
    type: "metadata";
} | {
    type: "tag";
    value?: SeedApi.examples.CommonsTag | undefined;
};
