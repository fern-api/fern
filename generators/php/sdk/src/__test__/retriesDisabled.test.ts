import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { getRetriesDisabledStatement, isRetriesDisabled } from "../endpoint/utils/retriesDisabled.js";

const context = {
    getRequestOptionsName: () => "options",
    getMaxRetriesOptionName: () => "maxRetries"
};

function endpoint(retries: FernIr.RetriesConfiguration | undefined): Pick<FernIr.HttpEndpoint, "retries"> {
    return { retries };
}

describe("isRetriesDisabled", () => {
    it("is true when the endpoint disables retries", () => {
        expect(isRetriesDisabled(endpoint({ disabled: true }))).toBe(true);
    });

    it("is false when the endpoint explicitly enables retries", () => {
        expect(isRetriesDisabled(endpoint({ disabled: false }))).toBe(false);
    });

    it("is false when the endpoint omits the disabled flag", () => {
        expect(isRetriesDisabled(endpoint({ disabled: undefined }))).toBe(false);
    });

    it("is false when the endpoint has no retries configuration", () => {
        expect(isRetriesDisabled(endpoint(undefined))).toBe(false);
    });
});

describe("getRetriesDisabledStatement", () => {
    it("pins maxRetries to 0 when retries are disabled", () => {
        expect(getRetriesDisabledStatement({ context, endpoint: endpoint({ disabled: true }) })).toBe(
            "$options['maxRetries'] = 0"
        );
    });

    it("emits nothing when retries are not disabled", () => {
        expect(getRetriesDisabledStatement({ context, endpoint: endpoint(undefined) })).toBeUndefined();
        expect(getRetriesDisabledStatement({ context, endpoint: endpoint({ disabled: false }) })).toBeUndefined();
    });
});
