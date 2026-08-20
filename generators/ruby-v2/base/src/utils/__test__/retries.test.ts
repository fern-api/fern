import { areRetriesDisabled, hasEndpointWithRetriesDisabled } from "../retries.js";

describe("areRetriesDisabled", () => {
    test("is true when the endpoint disables retries", () => {
        expect(areRetriesDisabled({ retries: { disabled: true } })).toBe(true);
    });

    test("is false when retries are absent or not disabled", () => {
        expect(areRetriesDisabled({ retries: undefined })).toBe(false);
        expect(areRetriesDisabled({ retries: { disabled: false } })).toBe(false);
        expect(areRetriesDisabled({ retries: { disabled: undefined } })).toBe(false);
    });
});

describe("hasEndpointWithRetriesDisabled", () => {
    test("is true when any endpoint disables retries", () => {
        expect(hasEndpointWithRetriesDisabled([{ retries: undefined }, { retries: { disabled: true } }])).toBe(true);
    });

    test("is false when no endpoint disables retries", () => {
        expect(hasEndpointWithRetriesDisabled([{ retries: undefined }, { retries: { disabled: false } }])).toBe(false);
        expect(hasEndpointWithRetriesDisabled([])).toBe(false);
    });
});
