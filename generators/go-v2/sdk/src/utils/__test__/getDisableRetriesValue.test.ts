import { go } from "@fern-api/go-ast";
import { describe, expect, it } from "vitest";

import { getDisableRetriesValue } from "../getDisableRetriesValue.js";

const whenEnabled = go.TypeInstantiation.reference(go.codeblock("options.DisableRetries"));

describe("getDisableRetriesValue", () => {
    it("forces retries off when the endpoint disables retries", () => {
        expect(getDisableRetriesValue({ endpoint: { retries: { disabled: true } }, whenEnabled })).toEqual(
            go.TypeInstantiation.bool(true)
        );
    });

    it("forwards the request options when the endpoint explicitly enables retries", () => {
        expect(getDisableRetriesValue({ endpoint: { retries: { disabled: false } }, whenEnabled })).toBe(whenEnabled);
    });

    it("forwards the request options when the endpoint omits the disabled flag", () => {
        expect(getDisableRetriesValue({ endpoint: { retries: { disabled: undefined } }, whenEnabled })).toBe(
            whenEnabled
        );
    });

    it("forwards the request options when the endpoint has no retries configuration", () => {
        expect(getDisableRetriesValue({ endpoint: { retries: undefined }, whenEnabled })).toBe(whenEnabled);
    });
});
