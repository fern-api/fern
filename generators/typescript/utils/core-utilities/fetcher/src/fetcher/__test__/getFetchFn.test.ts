import { getFetchFn } from "../getFetchFn";

describe("Test for getFetchFn", () => {
    it("should get fetch function", async () => {
        expect(await getFetchFn()).toBe(fetch);
    });
});
