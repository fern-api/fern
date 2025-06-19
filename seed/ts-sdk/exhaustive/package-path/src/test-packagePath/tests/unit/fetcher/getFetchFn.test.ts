import { getFetchFn } from "../../../../../src/test-packagePath/core/fetcher/getFetchFn.js";
import { RUNTIME } from "../../../../../src/test-packagePath/core/runtime/index.js";

describe("Test for getFetchFn", () => {
    it("should get node-fetch function", async () => {
        if (RUNTIME.type == "node") {
            if (RUNTIME.parsedVersion != null && RUNTIME.parsedVersion >= 18) {
                expect(await getFetchFn()).toBe(fetch);
            } else {
                expect(await getFetchFn()).toEqual((await import("node-fetch")).default as any);
            }
        }
    });

    it("should get fetch function", async () => {
        if (RUNTIME.type == "browser") {
            const fetchFn = await getFetchFn();
            expect(typeof fetchFn).toBe("function");
            expect(fetchFn.name).toBe("fetch");
        }
    });
});
