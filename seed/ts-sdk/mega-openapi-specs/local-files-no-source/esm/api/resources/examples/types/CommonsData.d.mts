import type * as SeedApi from "../../../index.mjs";
export type CommonsData = SeedApi.examples.CommonsData.String | SeedApi.examples.CommonsData.Base64;
export declare namespace CommonsData {
    interface String {
        type: "string";
        value?: string | undefined;
    }
    interface Base64 {
        type: "base64";
        value?: string | undefined;
    }
}
