import { getFetchFn } from "../../../src/core/fetcher/getFetchFn";

describe("Test for getFetchFn", () => {
    it("should get fetch function", async () => {
        expect(await getFetchFn()).toBe(fetch);
    });
});
