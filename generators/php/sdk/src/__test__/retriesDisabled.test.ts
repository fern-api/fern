import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { getRetriesDisabledStatement, isRetriesDisabled } from "../endpoint/utils/retriesDisabled.js";

type EndpointRetries = { retries?: FernIr.RetriesConfiguration };

function endpoint({ retries }: EndpointRetries): FernIr.HttpEndpoint {
    // The helpers read only the retries field; the rest of the endpoint is irrelevant here.
    return { retries } as unknown as FernIr.HttpEndpoint;
}

const context = {
    getRequestOptionsName: () => "options",
    getMaxRetriesOptionName: () => "maxRetries"
};

describe("isRetriesDisabled", () => {
    it("is true when the endpoint disables retries", () => {
        expect(isRetriesDisabled(endpoint({ retries: { disabled: true } }))).toBe(true);
    });

    it("is false when the endpoint explicitly enables retries", () => {
        expect(isRetriesDisabled(endpoint({ retries: { disabled: false } }))).toBe(false);
    });

    it("is false when the endpoint omits the disabled flag", () => {
        expect(isRetriesDisabled(endpoint({ retries: { disabled: undefined } }))).toBe(false);
    });

    it("is false when the endpoint has no retries configuration", () => {
        expect(isRetriesDisabled(endpoint({}))).toBe(false);
    });
});

describe("getRetriesDisabledStatement", () => {
    it("pins maxRetries to 0 when retries are disabled", () => {
        expect(getRetriesDisabledStatement({ context, endpoint: endpoint({ retries: { disabled: true } }) })).toBe(
            "$options['maxRetries'] = 0"
        );
    });

    it("emits nothing when retries are not disabled", () => {
        expect(getRetriesDisabledStatement({ context, endpoint: endpoint({}) })).toBeUndefined();
        expect(
            getRetriesDisabledStatement({ context, endpoint: endpoint({ retries: { disabled: false } }) })
        ).toBeUndefined();
    });
});
